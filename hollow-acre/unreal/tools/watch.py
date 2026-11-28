"""Watch: a local video-understanding model (Qwen2.5-VL-7B-Instruct, Apache 2.0, run 4-bit on the GPU) that watches a
stretch of a capture as moving footage and answers questions about it in words: whether the creature pops in or out,
moves unnaturally, reads as scary. (The owner: "find a tool you can use to watch videos better".) Run it when nothing
else is using the GPU (not during an Unreal render).

Install (once, outside the repo): the ears.py venv plus qwen-vl-utils and av; the model in
D:/HollowAcreTools/models/Qwen2.5-VL-7B-Instruct.

Run: <venv python> watch.py <jobs.json>
  jobs.json: [{"frames": "<capture dir of frame_00000.png...>", "t0": 30.0, "t1": 42.0, "fps": 4, "ask": "question"}, ...]
  (capture frames are at 30 a second; t0/t1 in seconds; "video": "<file.mp4>" instead of "frames" for a video file)
"""
import json
import os
import sys

import torch
from qwen_vl_utils import process_vision_info
from transformers import AutoProcessor, BitsAndBytesConfig, Qwen2_5_VLForConditionalGeneration

MODEL = os.environ.get('WATCH_MODEL', 'D:/HollowAcreTools/models/Qwen2.5-VL-7B-Instruct')
CAP_FPS = 30


def main():
    jobs = json.load(open(sys.argv[1], encoding='utf-8'))
    q = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_compute_dtype=torch.float16, bnb_4bit_quant_type='nf4')
    model = Qwen2_5_VLForConditionalGeneration.from_pretrained(MODEL, quantization_config=q, device_map='cuda:0')
    proc = AutoProcessor.from_pretrained(MODEL)
    for j in jobs:
        fps = float(j.get('fps', 4))
        if 'frames' in j:
            step = max(1, int(round(CAP_FPS / fps)))
            idx = range(int(j['t0'] * CAP_FPS), int(j['t1'] * CAP_FPS), step)
            video = ['file://' + os.path.join(j['frames'], 'frame_%05d.png' % i).replace('\\', '/') for i in idx]
            video = [v for v in video if os.path.exists(v[7:])]
            if len(video) % 2:
                video = video[:-1]
            vis = {'type': 'video', 'video': video, 'max_pixels': int(j.get('max_pixels', 448 * 252))}
        else:
            vis = {'type': 'video', 'video': 'file://' + j['video'].replace('\\', '/'), 'fps': fps, 'max_pixels': int(j.get('max_pixels', 448 * 252))}
        messages = [{'role': 'user', 'content': [vis, {'type': 'text', 'text': j['ask']}]}]
        text = proc.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        images, videos, kw = process_vision_info(messages, return_video_kwargs=True)
        kw = {k: (v[0] if isinstance(v, (list, tuple)) and len(v) == 1 else v) for k, v in dict(kw or {}).items()}
        if 'frames' in j:
            kw['fps'] = fps
        inputs = proc(text=[text], images=images, videos=videos, padding=True, return_tensors='pt', **(kw or {})).to('cuda:0')
        out = model.generate(**inputs, max_new_tokens=int(j.get('max_tokens', 400)), do_sample=False)
        ans = proc.batch_decode(out[:, inputs['input_ids'].shape[1]:], skip_special_tokens=True)[0]
        where = j.get('frames', j.get('video', ''))
        print('=== %s [%s-%s s]\nQ: %s\nA: %s\n' % (os.path.basename(where.rstrip('/\\')), j.get('t0', ''), j.get('t1', ''), j['ask'], ans.strip()), flush=True)
        del inputs, out
        torch.cuda.empty_cache()


if __name__ == '__main__':
    main()
