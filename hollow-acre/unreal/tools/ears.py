"""Ears: a local audio-understanding model (Qwen2-Audio-7B-Instruct, Apache 2.0, run 4-bit on the GPU) that listens to
sound clips and answers questions about them in words. Used to judge the cutscenes' sound against references (the
owner: use Until Dawn and The Quarry as the sound design reference; "I need you to actually hear it").

Install (once, outside the repo): a venv with torch (CUDA), transformers, accelerate, bitsandbytes, librosa; the model in
D:/HollowAcreTools/models/Qwen2-Audio-7B-Instruct.

Run: <venv python> ears.py <jobs.json>
  jobs.json: [{"file": "...wav", "t0": 30.0, "dur": 25.0, "ask": "question"}, ...]  (clips up to 30 s)
Prints each answer.
"""
import json
import os
import sys

import librosa
import torch
from transformers import AutoProcessor, BitsAndBytesConfig, Qwen2AudioForConditionalGeneration

MODEL = os.environ.get('EARS_MODEL', 'D:/HollowAcreTools/models/Qwen2-Audio-7B-Instruct')


def main():
    jobs = json.load(open(sys.argv[1], encoding='utf-8'))
    proc = AutoProcessor.from_pretrained(MODEL)
    q = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_compute_dtype=torch.float16, bnb_4bit_quant_type='nf4')
    model = Qwen2AudioForConditionalGeneration.from_pretrained(MODEL, quantization_config=q, device_map='cuda:0')
    sr = proc.feature_extractor.sampling_rate
    for j in jobs:
        y, _ = librosa.load(j['file'], sr=sr, offset=float(j.get('t0', 0.0)), duration=min(30.0, float(j.get('dur', 30.0))), mono=True)
        conv = [{'role': 'user', 'content': [{'type': 'audio', 'audio_url': 'clip'}, {'type': 'text', 'text': j['ask']}]}]
        text = proc.apply_chat_template(conv, add_generation_prompt=True, tokenize=False)
        try:
            inputs = proc(text=text, audio=[y], sampling_rate=sr, return_tensors='pt', padding=True)
        except TypeError:
            inputs = proc(text=text, audios=[y], sampling_rate=sr, return_tensors='pt', padding=True)
        inputs = inputs.to('cuda:0')
        out = model.generate(**inputs, max_new_tokens=int(j.get('max_tokens', 350)), do_sample=False)
        ans = proc.batch_decode(out[:, inputs['input_ids'].shape[1]:], skip_special_tokens=True)[0]
        print('=== %s [%s +%s s]\nQ: %s\nA: %s\n' % (os.path.basename(j['file']), j.get('t0', 0), j.get('dur', 30), j['ask'], ans.strip()), flush=True)


if __name__ == '__main__':
    main()
