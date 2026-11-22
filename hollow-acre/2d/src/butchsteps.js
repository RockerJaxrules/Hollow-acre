/* ================= t374 (butchsteps.js) the whole of it, in the order it is really done (owner: "butchering should include you
   needing to wash the meat skin the animal ... plucking the chicken washing the blood off all that"; "make it realistic so it's
   accurate"). Done yourself, after the kill. The hen: hung by her feet to bleed, scalded in the pot, plucked by the handful, cut down
   off her feet, opened at the vent and drawn (the heart, the liver and the gizzard kept as giblets, the crop pulled at the neck),
   rinsed until the water runs clear, then jointed. The cow: her head and her shanks taken off, skinned where she lies (the hide comes
   off in one piece, the fat side up), hoisted on the gambrel, opened and gutted (the paunch and the guts roll out into the tub, the
   heart, the lungs and the liver cut free), split down the spine with the saw, the side washed down, then broken down. The hen
   gives feathers and giblets, the cow a raw hide and her heart and liver. Toned: the same steps, dark blood, nothing of the insides
   shown. Every step is one short interaction: a tug (hold, feel it give, let go), a chop (strike when the ring closes), the knife's
   line, or holding to pour and scrub. ================= */
const BS={};
BS.full=()=>!window.GORE_TONED;
BS.after=()=>typeof BK!=='undefined'&&BK.after?BK.after:{};
/*@@STEPDATA (t373/mkdata2.py: the cow cut apart and skinned, drawn in cow_lie.py) */
Object.assign(BK.IMG,{
 cowBodyB:[199,105,"#2a140c,#ecc58a,#cc8f50,#4a2220,#a8663a,#7a3e2a,#844e30,#5e3024,#c8945c,#52301e,#341c14,#7a5038,#704430,#1e100c,#ac6270,#d4928e,#7a3a4c,#6c3c28,#3a1a1c,#f8d0c4,#4a2620,#2c1616",".145A8.89A.99A2B8A3.85ACA3.89A7B9CB2DA2.81A2C2B3A3.68A18B7C11E2BDA2.78AB2C5B3A3.46A19B18C16E6B2A.75A2C9E2B3A3.24A19B19C34E6C3A2.72AB2C9E5B3A3.3A18B19C52E6CE2CB2A2.4A6.58A2C12E8B3A3B18C78E4CB2A4B6A2.55AB2C11E12B3C80F4C7F3C2E5C2B4C4E2B2A.52A2C14E15C84F7C6E6C4B5E4A.50AB2C14E11C100E8C8E5A.47A2C16E11C101E8C5E3G2E3A.46AB2C16E10C18EC83E9C2ECE2G4E2A.45AC19E9C9E2C8EC82E10F8G3EA.43A2C20E9C9E2C9EC81E15G7A.42AB2C20E8C10E2C9EC80E12F2E3H2G5A.39A2C23E7C11E3C9EC77E14F3E3H2G5A.37AB2C22E8C11E3C9EC77E15F3D3H2G5A.34A2C25E7C11E4C9FEC75E16F3D3AH2G5A.32AB2C24E7C12E4C10FEC34EC40E16F3D3AH2G5A.29A2C24E10C11E5C10FEC33E3C38E16F4D3A2H2G5A.27AB2C20E2C2E9C11E6C10FEC33E3C38E16F5D2A.AH2G5A.24A2C22E3CE9C12E7C10FEC18E2C13E2CEC34E18F5D2A.2AH2G4HA.22AB2C21E4CE8C12E8C10FEC17E3C5ECE4CE6C34E18F5D2A.2AH2G3HA.21ABC22E13C13E10C8FE8C11E2CE10CE6C31ECE19F4D3A.3AHG3H2A.20ABC20E14C14E12C3E2C2FE13C4E3CE17C31ECE19F4D3A.4AG3H2A.20ABC19E14C15E12CE4C2FE14CECE22C30ECE19F4D3A.5AIG2H2A.18ABC19E15C15E12CE4C2FE14CE23C10E2C18E22F5D2A.5AIG2H2A.18ABC17EC2E13C15E13CE4C2FE38C8E5C17E22F5D3A.4AG4HA.18ABC15E3CE14C15E20CFE43C2E4C18E22F5D3A.5AG3H2A.17ABC14E4CE13C16E20CFE43CE5C17E22F6D3A.5AG3H2A.16ABC14E19C16E20CFE43CE5C17E22F6D3A.6AG3H2A.15ABC13E20C16E20CFE49C13E25F7D4A.5AG3H2A.15ABC13E19C17E20CFE49C12E25F8D4A.6AG3HA.15ABC13E16FE2C16E22CFE25CE21C12E26F8D4A.6AG3H2A.14ABC13E16FE2C15E23CFE25CE21C11E26F8D5A.7AIG2HA.13ABC13E17FE2C14E24CFE24CE22C12E24F9D6A.6AIG2H2A.12ABC13E18FC14E25CFE24CE22C11E24F10D6A.6AG3H2A.12ABC13E18FC13E26CFE10CE12CFE23C10E23F11D6A.7AIG2HA.12ABC13E18FC14E25CFE9CE13CFE23C6ECE25F12D5A.7AIG2HA.12ABC13E18FC11ECE26CFE9CE13CFE23C4E3CE25F11D6A.7AG3H2A.10ABC13E19FC11E28CFE8CE13CFE25CE5CE25F11D5A.9AIGH2A.10ABC13E20FC9E30FE8CFE12CFE19CE37F9D7A.9AIGH2A.10ABC13E20FC9E30FE7CFE13CFE19CE36F10D7A.9AIG2HA.10ABC13E20FC9E30FE7CFE12CFE19CE37F11D6A.9AIG2HA.9ABC14E20FC8E31FE6CFE13CFE19CE37F10D6A.10AG3H2A.8ABC13E21FC4E35FE6CFE13CFE19CFE35F11D6A.11AIGH2A.8ABC13E21FE2C2E35FE6CFE12CFE19CFE33F12D8A.11AIGH2A.8ABC13E22FECE36FE5CFE13CFE19CFE32F13D8A.11AG2H2A.8ABC13E22FE38FE5CFE13CFE19CFE30F14D9A.12AJ3KA.6ABC13E23FE38FE5CFE13CFE18CFE31F14D8A.12ALM2JK2A.5ABC13E23FE38FE4CFE14CFE18CFE30F14D9A.12ALMJ2KNA.5ABC13E23FE38FE5FE14FE19CFE29F14D10A.12ALMJ2KNA.5ABC13E23FE38FE5FE14FE19CFE28F16D9A.11ALMJ3KN2A.3ABC13E24FE38FE5FE14FE19CFE27F14DFD10A.11ALMJ3KN2A.3ABC13E24FE44FE14FE20FE26F15DFD9A.12ALJ4KN2A.3ABC12E25FE44FE14FE20FE24F16D12A.12ALJ4KN2A.3ABC12E25FE43FE15FE20FE23F16D13A.12ALJ3K2N2A.3ABC12E25FE59FE20FE24F20D8A.12AJ4K2N2A.2ABC12E26FE59FE20FE25F19D7A.14ALJ2K2NA.3ABC12E26FE59FE47F18D7A.14ALJK2N2A.3ABC12E26FE59FE49F17D6A.14AJ2K2N2A.3ABC12E26FE108F17D7A.15AK2N2A.4ABC13E25FE106F19D7A.16AN2A.4ABC13E26FE15C3E86F19D8A.18A2.5ABC13E25FE15C3E86F20D8A.25ABC13E25FE13C4E84FE2F18D10A.25ABC9EC2E26FE13C5E80F4EF19D8A2.25ABC7EC2ECE27FE13C2ECE2C3E67FE2F2E2F6EF14D2FD9A.27ABC3E5CE2CE27FE13CE2C6E59F5E2F2EF3EF21D3FD7A2.28AC2E7CE30FE7F2E6C8E59F4EF3EF23D5FD6A.31AE8CE29FE8F2EFE3C6ECE3F2E54F32D11A2.33AE37FE4F2EF3EFE2C6E2CE2F3E51F2EF31D11A.36AE36FE3F3EF3EFEC6E3CE3F3E49F3EF27DF3D9A2.38AE29FE5FE2F10C6E5FEF2DFE47F30D5FD9A.40AEF4E14F2EF3E3F3E4FEF10C6E5F2EF2DF2E5F2E14FE30F23D14A2.42AF6E11F7EFEF4E2FE2F9C7E5F4D2F2E2F8E2F6E2F2E32F16D3F3D12A.45AF6E9F8EF6E2F12C6E5F4D4FEF9EF7EF2E33F18D2FD11A2.47AF6E7F16EF12C6E5F6D3FEF16E8FE27FE2F15D3FD10A.50AF5E7F16EF11C6E5F4DFD3F17E10F4E2F2E2F2E2F9E2F4EF14DF2D9A4.52AF4E6F26DFC8E3F4D2FD3F15E10F6EF3EF3EF10EF5EF12D3FD7A3.57ABF2E5F25D3C8E3F6DFD2F16E4F3E2F11EF3EF10EF16D9A4.59A2BE7F13DF10D4C6E4F4DFD5F17E2F4EF42D8A3.62AB2E10D7FDFD15C8E3F3D2FD6F11DF4EF5EF39D8OA2.64AE13D9FD14C8E3F3D10F7D2F2DF4EF43D8P2O2A.63AE14D6C6E2D10C6E6FD11F6D3FD4F2EF33DF2D5FD7P4O3A.62AE8FE2FED4C10E4D4HC7E6D7AD4F6D4FD4FD5F20DF2D2F2D4FD11P5O6A.62AF8EF2ED2FC3E12FG3C8E6D6A.A4F6D4FD10F2D4F2DF9D3FD3FD5FD7P7O6Q2A.63AFD2F4D5AE15F3GC8E6D6A.6A3F3D21FD2F2D3F3D4FD3FD9P8O8Q3A.64A2D8A3E13F5GC7E7D5A.10A21D6FD4FD13A6P4O12Q4A.66A8.3AE3F3E2F3E2FD2G3C5E7D4A2.32A21DA3.6AO14Q4A.79AEF4EF4D4G3RC6E2FE2D4A.55A.10AO10Q6A.81A3F6D2G5R2C5E2F2ED4A.68AO4Q10A.85A4G7SR3C3E5FD4A.70ATO2Q6O3A.88AG8SR4E4FED5A.71ATO2A5TO3A.87AIG8SR4E3F3D4A.71ATO3A.3ATO2A.87A2IG7HSR4UF4D4A.72ATO2A.4ATO2A.86AV2G5HG2H2SU5F2D4A.73ATO2A.4ATO2A.86AV3G2H3GSHS3U8A2.74AO2A.5ATO2A.86AV3GH4S6AU6A.77A2.6AO2A.87AV4H2S7A.A6.87A2.88AV5H2S4A2.185AV7S3A.188A2V6A2.191A6.164",107,62],
 cowHeadB:[108,78,"#2a140c,#fff8e8,#d8ccae,#a8987a,#ecc58a,#cc8f50,#a8663a,#7a3e2a,#4a2220,#7a3a4c,#a8606a,#b89a5c,#8a7040,#f8e0d4,#dcb4a8,#f2d4c6,#3a1420,#b88a86,#8a5a5e,#5a3038,#2a0e18,#d8be80,#2a2018",".51A2.105AB2A2.102AC3B2A2.100AC5B2A2.99AC6B2A2.98A2D2C4B2A.99AD2C5DA.99AD3C3D2A.99AD3C3D2A.99A2C4D3A.99AC5D2A.20A4.76ABC4D2A.15A4E4A4.68A5BC4D3A.10A4E4F2G2E4A3.61A4E5FC5D3A.6A3E4F5G7E3A4.55A2E4F6C6D2A.2A4E3F7G12E4A3.51AE2F10C7D2A2E4F7G19E3A2.47A2F14C6D2E2F10G7HG15E2A.45AE2F14C6DF9GFG9H5G13IA.43AEF17C5F8G3FG4H3GH9G9HIA.43AEF17C4F6G6FGH2G2H2I2H2IJ6H4G2H3IA.42AF20C3F5G7H4GKJ6KJ6KJ4H3I2A.41AEF20GC2GF3G6KJ6KJ6KA2I4KJ4H2I2A.42AEF20G11H2KJ6I2HA2.5A13.41A2F22G9H7I5A2.59A2E2F23G7H4I2HI4A2.60AE2F17G2F3GFG4H3G2HIH2IHI2A2.60A2F20G3F2GFG4H3GH2IHI2HA2.61AE2F19G7FG6H3I2HIA2.61A2F22G14I7A.60A2E2F23G14H4I2A.59AE2F24G12HGH6IA.57A2F25GFG5HG6HGH5I2A.56AE2F24G7H2GHG3HLH4I4A.54A2F25G8H5G2HLMH4I3A.54AE2F24G8H6L3MH4I4A.52A2F25G10H5LM3H4I4A.52AE2F10LMF11G11H3L3MI2H4I5A.51AF13LMF9G12H3LM3I3H3I5A.51AF14LMF8G12HL3MHI5H4I3A.51AF14LMF7G12H2LM3HI6H3I4A.46A5F15LMF7G11L3MH3I7HIHI3A.45A2N5OF14LMF3G2FG10HLM3H3I8HI3A2.44A2N2P4O2F14LMFG4FG7HL3MGH6I2HI7A.45AN2P4O4F14LMG12HLM3H4I2HI3HI5A2.45AP6O5F14LMG10L3MH5IH2IHI4HIA3.46AP6O6F12GLMG9HLM3H4I3HI7HA.48AP5O8F11G2LMG7L3MH5I5HI6AH.48ANPQ4O8F9G4LMG5HLM3H6I11A.2H.47ANRQ4SO7F8G5LMG3L3MH8I12A.2H.46ANORQ4SO8F5G7LMGHLM3H5I2HI5H7IA.2H.46ANORQ4SO8F2G2F2G5LMHL2MH6IH2IHI2G3H7I2A.H.46ANORQ4SO8FG3FG6LMHM2H5I3HI2G6H7I2A.2H.44ANO3Q4O10G3FG6LMH6I6G10H4I3A.2H.44ANO4Q4O10G7H2LMH4I6G11H5I3A.2H.44ANO18G6H3LMH5I3G11HGH5I3A.2H.44ANO19G3H5LMH4I2G11H8I4A.2H.44ANO19RG3H3LMH3IHIG10H11I3A.2H.44ANO19R2GH4LMHIHI2G9H12I4A.2H.44ANO18R4H4LMHI3G8H12IHI3A.3H.44AO18R7H2LMI2G10H11I6A.3H.45ANO14R9S2LMIHG5H3GH11I6A.3H.46ANO12R11S2LMH10GH9I8A.3H.46AO8R15S2LMH19I9A.4H.47AR21S3LMH19I8A.5H.47AR20S4LMH14I2H2I8A.5H.49AR18S4TLMAH10I5H2I7A.6H.50AR16S4T2LMEG3H6I6HI6A2.7H.49U16S5T2LMG10HI6HI4A2.8H.53AR9S3U7LMU8G7H2I2A3.65S16G3LMG15H3I2A.68A2S15LMS2G13H4IA.70A2EG9V5G2H14IHI2A.71AEG4HG2H2MW3MGH15I4A.71AEG2H3GH3MW3MH14I5A.72AH6I4M5I3H2I3H2I9A.73AI17HI4HI9A.75AI16HI4HI7A2.77A29.64",50,72],
 cowShankF:[55,23,"#2a140c,#a8704a,#90583a,#6c3c28,#7a6a6e,#4a2620,#4a3a40,#120a0c,#2c1616,#1a1014,#2e2228",".15A7.47AB7A4.42ABC3D4B4A3.39ABC2D9B3A4.35ABCD13B4A3.5A11.6A4.6ABC2D16B3A3.AE11A.4AB4A3.3ABCF3D17B3A2EG4HG5A.3AD3F2B3A2.AF5D4FD15B2G5HG5A.2ABD3F5B2A3I6DF6D14G4HG6A.ABD2F8B3A2I7F6D8FD3G4HG6A.ABDF12B2FA4I2F2I3FD4F2DF2ID2G4HG6A.ADF2I2F12B2A6I3F2I2F5I2D2G4HG6A.2AF2I4F12BE5G4I10DAEG3HG6JA.2AI8F11G6K4A2I5A3EG3HG6JA.3A3I5F2IF9K9A.A5.2AJ12A.6A2I3FI4F8K9A.8A12.9A3FI6F6K3HK5A.32A3I7F2K4HK5A.35A2I5F2K4HK5A.37A3I3K5HK6A.39A3K5HK5JA.41AJ5HJ6A.42A12.21",137,155],
 cowSkinB:[199,105,"#2a140c,#f0e6cc,#c64c40,#dccaa4,#e8846a,#b8a07c,#a43030,#7a1c22,#802426,#5a1418,#4a0e16,#c05a4c,#a43838,#360a12,#fff8e8",".145A8.89A.99A2B8A3.85ACA3.89A7B2D8B3A2.81A2C2EB2A3.68A18B7D2FDF4DFD3B2A2.78AE2C3F2B3A3.46A19B18D8FCFC4FGFDFD2B2A.75A2C8DF2B3A3.24A19B19D24F2C6G4FGFD3BA2.72AE2C8FCGF2DB3A3.3A18B19D37F4DFC7G2H3G2HF3DB2A2.4A6.58A2C12G4F3DB3A3B18D39F2DF2DF4DF2DF2DC4FC17G2FD2B2A4B6A2.55AE2C12G7FD3B3D38F2DF4DF2DF2DF5C2FC2FC4FC2FC2FC22G3FD3B4F4DFB2A.52A2C14G9F2D4FDF2DF2DF4DF2DF7DF2DF2DF4DF3C2FC4FC2FC2FC45G3F3D2FDC4FGFDHA.50AE2C14GCG6C3F4CFC2FC2FC4FC2FC7FC2FC2FC4FC62G6DFCFG2C2G3FH2A.47A2C17GC2G5C104G6FC2G3CG2I2H3A.46AE2C16G2CG7C78EJ2C22G8C2G2CGI4H2A.45AC19G9C79EJ2C22G12HI6HA.43A2C20G9C80EJ2C22G11HI7A.42AE2C20G8C11GC69EJ2C21G11H3I7A.39A2C23G7C12G2C8EJ2C57EJ2C19GCG10H5I7A.37AE2C22G8C11G3C8EJ2C57EJ2C18G2CG10H3K3I7A.34A2C25G7C12G3C8EJ2C58EJ2C17G13H3K3AI7A.32AE2C17G5C2G7C9GC2G4C9EJ2C57EJ2C16G15H3K3AI7A.29A2C20G5CG8C9GC2G4C9EJ2C31GC25EJ2C16G15H3K3A2I7A.27AE2C20G13C9G2CG5C9EJ2C28GCG4C24EJ2C14G15H5K2A.AI7A.24A2C21G14C10G8C10EJ2C11GC2GC11G2CG5C10G7C6EJ2C14G15H5K2A.2AI6JA.22AE2C22G12C11G8C10EJ2C9G3CG2C10G9C8G9C6EJ2C13G16H6K2A.2AI5JA.21AEC21GCG12C12G8C10EJ2C9G3CG2CGC8G10C7G9C6EJ2C13G15H7K2A.3AI4J2A.20AEC18GC2GCG11C13G13C6EJ2C9G7C8G11C2GC2G10C7EJ2C11G17H6K2A.4AI3J2A.20AEC17G2CG13C14G13CGC4EJ2C8G8C7G12CG14C7EJ2C11G14HGH6K3A.5ALI2J2A.18AEC17G17C14G19EJ2C6GCG8C2G17CG14C7EJ2C10G15HGH6K3A.5ALI2J2A.18AEC16G17C15G17C2EJ2C6G11CG32C7EJ2C9G16H8K4A.4AI4JA.18AEC15G18C14G18C3EJ2GC2G13CG31C8EJ2C7G19H7K4A.5AI3J2A.17AEC15G17C14G19C3EJ2G2C2G44C9EJ2CG2CG21H7K4A.5AI4JA.16AEC12G2CG18C13G21C2EJ2G2CG45C9EJ2G25H7K4A.6AI3J2A.15AEC10G23C12G22C2EJ2G48C9EJ2G25H7K5A.5AI3J2A.15AEC11G21C13G21C3EJ2G48C8GEJ2G25H7K5A.6AI3JA.15AEC11G21C13G21C2G2EJ2G46C9GEJ2G25H7K5A.6AI3J2A.14AEC9G23C12G23CG2EJ2G46C8G2EJ2G25H7K5A.7ALI2JA.13AEC10G23C13G25EJ2G46C9G2EJ2G24H7K6A.6ALI2J2A.12AEC11G21C11GCG26EJ2G46C9G2EJ2G24H6K7A.6AI3J2A.12AEC12G20C10G2CG26EJ2G15EJ2G29C8G2EJ2G24H6K7A.7ALI2JA.12AEC12G20C9G30EJ2G14EJ2G30C8G2EJ2G24H6K7A.7ALI2JA.12AEC9G23C9G30EJ2G14EJ2G30C5G5EJ2G23H7K7A.7AI3J2A.10AEC11G22C8G31EJ2G14EJ2G31CG2C2G4EJ2G15H3G5H7K6A.9ALIJ2A.10AEC10G23C7G32EJ2G13EJ2G17EJ2G15CG5EJ2G14H6G3H6K7A.9ALIJ2A.10AEC11G22C7G32EJ2G13EJ2G17EJ2G15CG5EJ2G14H6G4H5K7A.9ALIJ2A.10AEC12G21C7G32EJ2G12EJ2G17EJ2G16CG5EJ2G15H6G2H6K7A.9ALI2JA.9AEC13G21C7G32EJ2G12EJ2G17EJ2G22EJ2G17H4G2H5K7A.10AI3J2A.8AEC12G22C7G32EJ2G11EJ2G17EJ2G23EJ2G17H4GH6K7A.11ALIJ2A.8AEC11G24C5G23HG9EJ2G11EJ2G17EJ2G23EJ2G17H10K8A.11ALIJ2A.8AEC11G24C3G24H2G9EJ2G11EJ2G17EJ2G23EJ2G14HGH11K8A.11AI2J2A.8AEC11G24C4G22H3G9EJ2G10EJ2G17EJ2G24EJ2G13H2GH10K9A.12AI3JA.6AEC12G24C3G24H2G9EJ2G10EJ2G17EJ2G24EJ2G12H14K8A.12ALM2IJ2A.5AEC12G26CG23H2G10EJ2G10EJ2G17EJ2G24EJ2G12H13K9A.12ALM2IJNA.5AEC12G49H3G10EJ2G9EJ2G18EJ2G24EJ2G12H12K10A.12ALMI2JNA.5AEC13G48H2G11EJ2G9EJ2G17EJ2G24EJ2G12H12K11A.11ALM2I2JN2A.3AEC15G60EJ2G9EJ2G17EJ2G24EJ2G12H11K12A.11ALMI3JN2A.3AEC12GCG60EJ2G10EJ2G17EJ2G24EJ2G12H10K5H3K4A.12ALMI3JN2A.3AEC12GCG60EJ2G10EJ2G17EJ2G24EJ2G10H11K5H5K3A.12ALI4JN2A.3AEC12GCG60EJ2G10EJ2G17EJ2G24EJ2G3H6GH18KHK4A.12ALI3J2N2A.3AEC6G68EJ2G9EJ2G18EJ2G24EJ2G4H24K6A.12AI4J2N2A.2AEC7G68EJ2G9EJ2G18EJ2G23EJ2G8H22K4A.14ALI2J2NA.3AEC7GCG78EJ2G18EJ2G23EJ2G13H17K4A.14ALIJ2N2A.3AEC7GC2G77EJ2G18EJ2G23EJ2G14H16K4A.14AI2J2N2A.3AEC10G47C2G28EJ2G18EJ2G23EJ2G13H14KHK5A.15AJ2N2A.4AEC10G45C5G27EJ2G18EJ2G23EJ2G12H14K2HK5A.16AJNA.4AEC12G43C5G49EJ2G22EJ2G12H13K4HK4A.18A2.5AEC12G42C5G51EJ2G21EJ2G12H9K13A.25AEC12G40C6G76EJ2G6H12K2H2K12A.25AEC10G42C6G76EJ2G4H14K2HK11A2.25AEC5G4CG43C2G2C5G71HEJ2H18K14A.27AEC2G7CG43CG2C7G66H2G2HEJ2H16KH2K11A2.28AH6G4CG37H3G5C7G66H3GH2EJ2H16KHK11A.31AH6G39H5G4C7G4H2G61H3GHEJ2H15K13A2.33AH4G36H9G3C8G4H2G60H4GHEJ2H15K12A.36AH2G36H11GC8G4H4G9H4G45H7EJ2H14K11A2.38AG36H12C10G2H5G8H5GH5G41H5EJ2H9K2HK12A.40AG4HG18HG2H2G8H11C8GCG2H4K2G8H5GH7G38H5EJ2H9K3HK10A2.42AG2H2G13HG2H3GH4G5H12C8G2CGH4K3G6HGH14G38H11K3H3K12A.45AGH2G12H2GH4GH4GHG2H13C9G4H2K4G3HG2H16G34H2G2H13K2HK11A2.47AH2GHG9H3GH4GH4GHGH13C7GCG4H2K5G2H2GH15G32H6GH15KHK10A.50AH4G7H29C7G2CG4H3K3HGH18G21H6G2H10GH12KHK2HK6A4.52AH4G6H28C8G6H3K4HGH19G16H2GH7GH11GH10K3HK6A3.57AEG7H11K2H12K2HC8G7HKHK3H2GH20G7H6G2H2GH7GH15K2H2K9A4.59A2EC4G3H3K3H4K5H2K3H4K4C7G6H2K5H24G2H4G2H5GH11GH13K4HK7A3.62AE2C4G6K4HK8HK4HK2H2K2C9G3H3K6H24GH5GH6GH25K9BA2.64AC6G7HK3HK8HK4HK2HK2C7GCG3H3K8H29GH29KHK8B3DA.63AC2G3CG6H4K4C3G5K4HK2HK2C7G3H4K9H6K6H2K4H37K2H2KHK6B3D4A.62AG5CG5H5KC5G9K4JG2C6G3H4K5AK4H5K17H30KHK3HK6B5D6A.62AH2G2H8K2HC5G11J3G3C5G3H6K3A.A4H4K18HK4H2K2H2K3H2K2H2K2H2K3H2K2HK3HK2B8D5F2A.63AHGH6K4AG4CG12HJG4C4G3H6K3A.6A3HK23HK3HK4HK3HK3HK4H2K2HK2B10D7F2A.64A2HK3H2K2A3G4CG6H4GH2JG3C4G3H5K4A.10A21K7HK4HK3HK8A6B8D8F4A.66A8.3AH3G2H9K2J3GC6GH6K2A2.32A21KA3.6AD14F4A.79AH2GH6K5J3IC4GCG2H2KHK3A.55A.10AD11F5A.81A3K3H2K3J5I2C4GCGH2K2HK2A.68AD4F10A.85A4I6JNI3C2G3CG2HK4A.70AOD2F6D3A.88AI6J2NI4G6K5A.71AOD2A5OD3A.87ALI6J2NI4G2H2G2K4A.71AOD3A.3AOD2A.87A2LI5J3NI4JH6K2A.72AOD2A.4AOD2A.86AL2I5J3N3J5H4K2A.73AOD2A.4AOD2A.86ALI5J3N5J4N4A2.74AD2A.5AOD2A.86ALI3J4N6AN6A.77A2.6AD2A.87ALI2J6N4A.A6.87A2.88ALIJ2NJ3N3A2.185AN7JN2A.188A2N6A2.191A6.164",107,62],
 cowThighH:[49,53,"#2a140c,#ecc58a,#cc8f50,#a8663a,#7a3e2a,#a86c42,#c8945c,#844e30,#5e3024,#3a1a1c,#4a2220",".15A6.40A3B6A3.36AB3C5DB3A.34AC9D4EA.32AC10D3E3A.30AC11D4E3A.28ABC10D5E4A.27ABC10D5E4A.27ABC9D6E5A.25ABC9D8E5A.24ABC9D9E5A.23ABC6DCD11E4A.22AFDC4D3CD12E4A.20AF2D21E5A.18AF3D21EDE4A.16AF5D23E3A.15AGF5D24E3A.14AGF5HD2E5D16E4A.13AGF4H3DE5D16E5A.11AGFH8E5D16E5A.11AGFH9IE3D16EDE4A.10AGH10I2E2D3ED15E4A.9AGH8I5ED2E2D15E4A.9AGH8I7DE2DED15E3A.8AI2H6I9E2DED16E3A.8AGHIH2I12E3D2ED14E3A.7AGHIHI14E2DE2D14E3A.7AI19E5D13E4A.7AJ2I17E5D14E3A.7AJ3I16E8D11E3A.7AJ3I17E7D11E2A.8AJ2I18E7D11E2A.8AJI19E7D11E2A.8AIJ4I14J2E5D11E2A.9AJ4I15J2E4DE2D8E3A.9A2J2IJI13J2IE6D9EKA.11AJIJ2I12J2IJ2E5D5EDK3A.12AJ4I14J2AE5D3E2DK3A.13AJ4I14J2AE4D2E5KA.15AJ3I13J3A3E2DE3KEK2A.16AJ3I12J4A.AEDK4EKA.18AJ2I12J4A.2A2K4A2.20AJ2I11J5A.3A4.23AJ2I10J5A.31AJI10JIJ4A.31A2I9JIJ4A.33AI10J4A.34AIJ2I5J5A.35AJ3I2J6A.37AJ10A.38AJ8A.40A2J4A2.43A4.16",232,116],
 cowShankH:[48,32,"#2a140c,#a8704a,#90583a,#6c3c28,#4a2620,#2c1616,#4a3a40,#7a6a6e,#120a0c,#2e2228,#1a1014",".15A3.43A2B3A2.40AB2C2DB2A.39ABC2D5A2.36ABC2D6B2A.35ABCD8E2A.34ABD10E2A2.32AD4E2D7B2A.32AD2E5D8A2.31ADE6D7B2A.21A3.7A2E6D9A.18A2B3A2.7AE7D8A2.15AB2D2EB2A.7A2E5D8B2A.14ABD4E3A2.7AE6D9A2.11ABD4E4B2A.7A2E5D8BFA.A.8ABD2E9A2.7AE5D6E2FA2GA.7ABED2E8B2A.7A2E3D6E3AHG2A2.5AE2DFE11A2.7AE2DE3D2E3AHG2H2A.5AE2F2E10B2A.7A2DE3DF2EFG7A2.4AF5E11A2.7AE3F3EG8H2A.4A2F3E11B2A.7A2F4G3IG8A.5AF2E2F2E10A2.2A.4A4G4IG6A.7A2E2F2E10BFA2JA.5AG6IG2J2A.10A2F2EFE8F2AHJ2A2.2AG8I2JA.13AFEFEFE5F3AHJ2H2A.2AG8JI.15A2FEFEFE4F2J7A2.AG6J2A.17AF2EF3EF3J7H2A.A2G3J2A.19A2F4EF2J11A.2AG2JA.22A2F2EFJ3IJ7A.4AGA.25A3HJ4I2J4A.6A.28AHJ6IJ3A.34AK9IKA.16",260,148],
 cowThighS:[49,53,"#2a140c,#e8846a,#c64c40,#a43030,#7a1c22,#a43838,#c05a4c,#802426,#5a1418,#360a12,#4a0e16",".15A6.40A3B6A3.36AB3C5DB3A.34AC9D4EA.32AC10D3E3A.30AC11D4E3A.28ABC10D5E4A.27ABC10D5E4A.27ABC9D6E5A.25ABC9D8E5A.24ABC9D9E5A.23ABC6DCD11E4A.22AFDC4D3CD12E4A.20AF2D21E5A.18AF3D21EDE4A.16AF5D23E3A.15AGF5D24E3A.14AGF5HD2E5D16E4A.13AGF4H3DE5D16E5A.11AGFH8E5D16E5A.11AGFH9IE3D16EDE4A.10AGH10I2E2D3ED15E4A.9AGH8I5ED2E2D15E4A.9AGH8I7DE2DED15E3A.8AI2H6I9E2DED16E3A.8AGHIH2I12E3D2ED14E3A.7AGHIHI14E2DE2D14E3A.7AI19E5D13E4A.7AJ2I17E5D14E3A.7AJ3I16E8D11E3A.7AJ3I17E7D11E2A.8AJ2I18E7D11E2A.8AJI19E7D11E2A.8AIJ4I14J2E5D11E2A.9AJ4I15J2E4DE2D8E3A.9A2J2IJI13J2IE6D9EKA.11AJIJ2I12J2IJ2E5D5EDK3A.12AJ4I14J2AE5D3E2DK3A.13AJ4I14J2AE4D2E5KA.15AJ3I13J3A3E2DE3KEK2A.16AJ3I12J4A.AEDK4EKA.18AJ2I12J4A.2A2K4A2.20AJ2I11J5A.3A4.23AJ2I10J5A.31AJI10JIJ4A.31A2I9JIJ4A.33AI10J4A.34AIJ2I5J5A.35AJ3I2J6A.37AJ10A.38AJ8A.40A2J4A2.43A4.16",232,116],
});
/*@@END2*/
// ---------------------------------------------------------------- sounds (the game's own synth)
BS.snd={
  tear(k){k=k||1;A.hiss(.18,.16*k,'bandpass',MSV(850,.3),{q:1.2,slide:420,wobble:1});A.tone(MSV(170,.2),.12,'sawtooth',.025*k,{slide:80,filter:['lowpass',500,2]});},
  give(){A.hiss(.06,.14,'bandpass',MSV(1400,.2),{q:2});A.tone(MSV(300,.2),.05,'sine',.05,{slide:140});},
  strain(){A.hiss(.14,.03,'bandpass',MSV(700,.2),{q:3,wobble:1});},
  pluck(){A.hiss(.05,.09,'highpass',MSV(3000,.2));A.hiss(.04,.05,'bandpass',1700,{q:2,delay:.025});},
  splash(k){k=k||1;A.hiss(.45,.16*k,'lowpass',MSV(1100,.2),{slide:320,wobble:1});for(let i=0;i<3;i++)A.tone(MSV(380,.3),.06,'sine',.04*k,{slide:160,delay:.05+i*.07});},
  pour(){A.hiss(.42,.07,'bandpass',MSV(1500,.15),{q:.7,wobble:1});},
  steam(){A.hiss(.7,.045,'highpass',2600,{wobble:1});},
  saw(){A.hiss(.11,.11,'bandpass',MSV(2100,.15),{q:3,slide:1500});A.tone(MSV(400,.1),.07,'sawtooth',.018,{filter:['bandpass',1300,4]});},
  scrub(){A.hiss(.09,.06,'bandpass',MSV(2600,.2),{q:1.5});},
  thump(){A.tone(90,.2,'sine',.26,{slide:42});A.hiss(.16,.18,'lowpass',600,{slide:180});}};
// ---------------------------------------------------------------- the tug: hold to pull; it gives (you hear it go); let go then.
// Hanging on past the give tears it (a mistake); letting go before it gives lets it slide back
BS.tug=()=>({h:0,give:.42+Math.random()*.28,gone:-1,down:false,wait:false,sq:0});
BS.tugUp=(T,dt,I)=>{const d=!!I.down;let r=null;if(T.wait){if(!d)T.wait=false;T.down=d;return null;}
  if(d){T.h+=dt;T.sq-=dt;if(T.gone<0&&T.sq<=0){T.sq=.16;BS.snd.strain();}if(T.gone<0&&T.h>=T.give){T.gone=T.h;BS.snd.give();}if(T.gone>=0&&T.h-T.gone>.42){r='tear';}}
  else if(T.down&&T.h>.04)r=T.gone>=0?'ok':'back';
  T.down=d;if(r){const keep=r==='tear';Object.assign(T,BS.tug(),{wait:keep,down:d});}return r;};
BS.tense=T=>T.gone>=0?1:Math.min(1,T.h/T.give);
BS.tugAuto=(o,T,AP,dt)=>{const a=m4ai(o,AP,dt);m4hold(a,!T.wait&&(T.gone<0||T.h-T.gone<.07));return a;};
// the chop: a ring closes on the joint again and again; strike when it is tight
BS.ring=t=>16*(1-((t*.8)%1));
BS.drawRing=(K,x,y,r)=>{const g=K.g;g.strokeStyle='rgba(255,210,122,.9)';g.lineWidth=1;g.beginPath();g.arc(x+.5,y+.5,Math.max(1.5,r)+3,0,Math.PI*2);g.stroke();K.pa(x-1,y-1,3,3,'#ffd27a',.8);};
// the hatchet coming down on a joint: its grip, so its edge lands on (x,y) at the blow
BS.hatchet=(K,x,y,u,bl)=>{const AI=.5,AR=-1.0,E=[32,11],ang=AR+(AI-AR)*u,px=x-(E[0]*Math.cos(AI)-E[1]*Math.sin(AI)),py=y+3-(E[0]*Math.sin(AI)+E[1]*Math.cos(AI))-(1-u)*6;
  M4.rot(K.g,BK.hatchet(bl||0),px,py,ang,36,10,-1,1);m4grip(K,px,py,ang,{side:-1});return [px,py];};
// a run of water: one stroke, pale and cold, tinted by what it carries (0 clear .. 1 red)
BS.WAT=['#22323e','#3a5868','#6a8ea4','#a4c4d4','#dcecf4'];
BS.tint=(c,k)=>{const a=[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)),b=[168,40,44];return '#'+a.map((v,i)=>Math.round(v+(b[i]-v)*k*.75).toString(16).padStart(2,'0')).join('');};
BS.water=(K,pts,w,k)=>{const P=BS.WAT.map(c=>BS.tint(c,k||0));BK.stream(K,pts,w,[P[0],P[1],P[2],P[3],P[4]]);};
// steam: solid round puffs in three greys that swell, rise and go
BS.steam=(K,L,t)=>{for(let i=L.length-1;i>=0;i--){const p=L[i],a=t-p.t0;if(a>1.6){L.splice(i,1);continue;}const r=Math.round(2+a*4*p.s),x=Math.round(p.x+Math.sin(a*3+p.x)*3),y=Math.round(p.y-a*26);
    const G=['#9a968e','#c4c0b8','#e8e4dc'],al=Math.max(0,.75-a*.45);K.g.globalAlpha=al;K.ell(x,y,r,r*.8,G[0]);K.ell(x-1,y-1,Math.max(1,r-1),Math.max(1,r*.8-1),G[1]);if(r>3)K.ell(x-2,y-2,Math.max(1,r-3),Math.max(1,r*.6-2),G[2]);K.g.globalAlpha=1;}};
// feathers drifting down: each a small curved feather, swaying as it falls
BS.feather=(K,f,t)=>{const a=t-f.t0,x=Math.round(f.x+f.vx*a+Math.sin(a*4+f.ph)*4),y=Math.round(f.y+Math.min(a*f.vy,f.land-f.y)),fl=Math.floor(a*4+f.ph)%2;
  const W=BG71.WHT;if(fl){K.px(x,y,6,2,W[5]);K.px(x+1,y+2,4,1,W[3]);K.px(x,y+1,6,1,W[2]);K.px(x-1,y+1,1,1,W[1]);}else{K.px(x,y,2,6,W[5]);K.px(x+2,y+1,1,4,W[3]);K.px(x+1,y,1,6,W[2]);K.px(x+1,y+6,1,1,W[1]);}};
// the plucked feathers gathered in a drift on the boards under her, growing
BS.heap=(K,x,y,u)=>{if(u<=0)return;const W=BG71.WHT,w=Math.round(8+u*26),h=Math.round(2+u*6);K.ell(x,y,w/2+1,h/2+1,'#3a3044');K.ell(x,y,w/2,h/2,W[3]);K.ell(x-2,y-1,w/2-3,h/2-1,W[4]);
  for(let i=0;i<Math.round(u*6);i++){const fx=x-w/2+3+((i*13)%Math.max(1,w-6)),fy=y-h/2-1+(i%2);K.px(fx,fy,4,1,W[5]);K.px(fx+1,fy+1,2,1,W[2]);}};
BS.featherOnFist=(K,x,y,n)=>{const W=BG71.WHT;x=Math.round(x);y=Math.round(y);for(let i=0;i<Math.min(4,n);i++){const [dx,dy]=[[-6,-4],[3,-6],[-2,2],[5,1]][i];K.px(x+dx,y+dy,3,1,W[5]);K.px(x+dx+1,y+dy+1,2,1,W[3]);}};

// ================================================================ the hen
// hanging by her feet from the rail: feathered and dry ('f'), wet from the pot ('w'), or plucked ('p': goosebumped, pale)
BS.SKIN=['#6a3c30','#94584a','#c08470','#dca896','#f0ccb8','#fae6d8'];
BS.WET=['#2e2838','#565068','#7e788e','#a8a2b4','#cac4cc','#dcd6d6'];
BS.henShapes=v=>{const F=v==='p'?BS.SKIN:v==='w'?BS.WET:BG71.WHT,Y=BG71.BEAK,b=v==='p'?3.2:3.4,S=[];
  S.push({t:'tube',pts:[[21,3],[20,19]],r0:1.8,r1:2.1,P:Y,base:2.6,gain:3},{t:'tube',pts:[[27,3],[28,19]],r0:1.8,r1:2.1,P:Y,base:2.2,gain:3});
  for(const [a,c] of [[[21,3],[16,1]],[[21,3],[18,-1]],[[27,3],[32,1]],[[27,3],[30,-1]]])S.push({t:'tube',pts:[a,c],r0:.9,r1:.7,z:.5,P:Y,base:2.4,gain:3});
  if(v!=='p')S.push({t:'tube',pts:[[30,24],[38,15],[43,9]],r0:3.4,r1:1.4,z:1,P:F,base:b-.4,gain:3});else S.push({t:'tube',pts:[[29,24],[32,20]],r0:3,r1:2,z:1,P:F,base:b-.4,gain:3});
  S.push({t:'dome',cx:18,cy:27,rx:7,ry:9,top:6,z:2,P:F,base:b,gain:3.4},{t:'dome',cx:30,cy:27,rx:7,ry:9,top:6,z:2,P:F,base:b-.3,gain:3.4});
  S.push({t:'dome',cx:24,cy:44,rx:16,ry:20,top:12,z:1,P:F,base:b,gain:3.4},{t:'dome',cx:24,cy:59,rx:12,ry:11,top:7,z:1.5,P:F,base:b-.2,gain:3.4});
  S.push({t:'tube',pts:[[10,32],[6,48],[5,62]],r0:v==='p'?3.6:5,r1:v==='p'?2.4:3,z:3,P:F,base:b+.2,gain:3.4},{t:'tube',pts:[[38,32],[42,48],[43,62]],r0:v==='p'?3.6:5,r1:v==='p'?2.4:3,z:3,P:F,base:b-.6,gain:3.4});
  S.push({t:'tube',pts:[[24,66],[24,81]],r0:5,r1:3.6,z:1,P:F,base:b-.3,gain:3});return S;};
BS.henHang=v=>BG71.spr('bshenhang2_'+v,48,90,BS.henShapes(v),(K)=>{const R=BG71.RAW,B=BG71.BL,W=v==='p'?BS.SKIN:v==='w'?BS.WET:BG71.WHT;
    // the cut end of her neck at the bottom: ragged, the bone to one side, the blood gathered down it
    K.px(21,82,7,2,R[3]);K.px(20,83,9,2,R[2]);K.px(21,85,7,1,R[1]);K.px(22,82,2,2,'#ece0c4');K.px(23,83,1,1,'#8a6a50');K.px(20,82,1,1,W[3]);K.px(28,83,1,1,W[2]);
    if(v!=='p'){// the primaries at each wing's tip, a few darker lines; wet: the feathers hang in clumps, dark seams between
      for(const [x,y] of [[4,58],[6,60],[42,58],[44,60]])K.px(x,y,1,3,W[2]);
      if(v==='w')for(const [x,y,l] of [[14,36,9],[20,40,12],[28,38,10],[33,44,8],[18,52,9],[26,55,8],[16,24,5],[31,25,5]]){K.px(x,y,1,l,W[1]);K.px(x+1,y,1,Math.round(l*.6),W[3]);}}
    else{// the skin: goosebumped where the feathers were, each follicle a lit bump; the wing joints and the parson's nose
      for(let y=14;y<78;y+=4)for(let x=8+((y/4)%2)*2;x<42;x+=4){const c=K.g.getImageData(x,y,1,1).data;if(!c[3])continue;if(c[0]<200)continue;K.px(x,y,1,1,BS.SKIN[3]);K.px(x,y-1,1,1,BS.SKIN[5]);}
      K.px(5,46,2,2,BS.SKIN[2]);K.px(42,46,2,2,BS.SKIN[1]);}},'#2a2030');
// the plucked bird cut through into one canvas per handful of feathers, so each comes away on its own
BS.henPatches=()=>{if(BS._hp)return BS._hp;const im=BS.henHang('w'),w=im.width,h=im.height,src=im.getContext('2d').getImageData(0,0,w,h).data;
  const C=[[18,26],[30,26],[15,40],[33,40],[24,52],[24,64],[6,48],[42,48],[37,16]],Hs=(x,y)=>((x*374761393+y*668265263)>>>16)%7/7;
  const cv=C.map(()=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;}),ids=C.map((_,i)=>cv[i].getContext('2d').createImageData(w,h));
  for(let y=19;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(!src[i+3])continue;let b=0,bd=1e9;C.forEach(([cx,cy],k)=>{const d=Math.hypot(x-cx,(y-cy)*.8)+Hs(x,y)*4;if(d<bd){bd=d;b=k;}});
    const o=ids[b].data;o[i]=src[i];o[i+1]=src[i+1];o[i+2]=src[i+2];o[i+3]=255;}
  ids.forEach((d,k)=>cv[k].getContext('2d').putImageData(d,0,0));return BS._hp={C,cv};};
// a picture cut at a row: the part above (her feet, left on the hook) and the part below
BS.cutRows=(key,im,y0,y1)=>M4.pre(key,im.width,y1-y0,(K,g)=>{g.drawImage(im,0,y0,im.width,y1-y0,0,0,im.width,y1-y0);});
// the rail along the top of the barn the birds and the beasts are hung from
BS.rail=K=>{const W=CA_P.oak,I=BG71.IRON;K.px(0,4,320,9,W[2]);K.px(0,4,320,2,W[4]);K.px(0,12,320,1,W[0]);for(let x=12;x<320;x+=58)K.px(x,6,1,5,W[1]);K.px(0,13,320,2,I[2]);K.px(0,13,320,1,I[4]);};
BS.hook=(K,x,y0,y1)=>{const I=BG71.IRON;x=Math.round(x);for(let y=15;y<y1;y++)K.px(x,y,1,1,(y%3)?I[3]:I[1]);K.px(x-2,15,5,2,I[2]);K.px(x-2,15,5,1,I[4]);const R=['#5a4626','#8a7040','#b89a5c'];K.px(x-3,y1,7,2,R[2]);K.px(x-3,y1+2,7,1,R[0]);};
// the scald pot over its embers
BS.pot=(K,g,x,y)=>{const E=['#3a1206','#8a2e0a','#d8661a','#ffb040','#ffe08a'];K.pa(x+6,y+38,74,6,'#000',.35);K.ell(x+43,y+42,30,4,E[1]);K.ell(x+43,y+42,22,3,E[2]);K.ell(x+43,y+41,12,2,E[3]);
  for(const [fx,h] of [[x+30,5],[x+44,7],[x+56,4]]){K.px(fx,y+40-h,2,h,E[3]);K.px(fx,y+40-h,1,2,E[4]);}g.drawImage(M4S.pot(),x,y);};
// small drops falling from a wound into what's below: one at a time, a bead gathering first
BS.drip=(K,x,y0,y1,t,per,P)=>{const p=(t%per)/per;x=Math.round(x);if(p<.55){const l=1+Math.round(p/.55*2);K.px(x,y0,1,l,P[3]);K.px(x,y0+l,2,2,P[3]);K.px(x,y0+l,1,1,P[5]);}
  else{const q=(p-.55)/.45,y=Math.round(y0+3+q*q*(y1-y0-3));if(y<y1-1){K.px(x,y,1,3,P[3]);K.px(x,y,1,1,P[5]);}}};
// ---------------------------------------------------------------- scald: hung to bleed over the bucket, then held under in the pot
S4.hnScald=(sp,K)=>{const g=K.g,full=BS.full(),P=full?BG71.BL:BG71.BLT,BAND=[1.4,2.2],MAX=2.9;BK.warm([()=>{BS.henHang('f');BS.henHang('w');BK.bucket();M4S.pot();}]);
  const st={t:0,ph:'bleed',x:92,dunk:0,under:0,short:0,long:0,steam:[],wet:0,outT:0,score:1,blood:0};
  const release=()=>{const u=st.under;BS.snd.splash(.7);
    if(u<BAND[0]){st.short++;st.ph='ready';K.judge(.2,252,50,true);MS.miss&&MS.miss();}
    else{if(u>BAND[1]){st.long++;K.judge(.35,252,50,true);}else K.judge(1,252,50,true);st.ph='out';st.wet=1;st.score=Math.max(.5,1-.1*st.short-.2*st.long);}};
  return {title:'Scald her',how:'She hangs to bleed out, then over the pot. Hold to hold her under the hot water and let go when the mark is in the green: too short and the feathers won’t come, too long and the skin cooks.',hint:'Hold her under. Let go in the green.',st,
    update(dt,I){st.t+=dt;
      if(st.ph==='bleed'){st.blood=Math.min(1,st.blood+dt*.45);if(st.t>2.4)st.ph='move';}
      else if(st.ph==='move'){st.x+=(219-st.x)*Math.min(1,dt*4);if(Math.abs(st.x-219)<.6){st.x=219;st.ph='ready';}}
      else if(st.ph==='ready'){if(I.down&&!st.wasDown){st.ph='under';st.under=0;BS.snd.splash();BS.snd.steam();for(let k=0;k<5;k++)st.steam.push({x:196+k*11,y:134,t0:st.t-k*.05,s:1.4});}}
      else if(st.ph==='under'){st.under+=dt;if(!I.down||st.under>=MAX)release();}
      else if(st.ph==='out'){st.outT+=dt;if(st.outT>1.1){st.done=true;}}
      st.dunk+=((st.ph==='under'?1:0)-st.dunk)*Math.min(1,dt*10);st.wasDown=I.down;
      st.sT=(st.sT||0)-dt;if(st.sT<=0&&st.ph!=='bleed'){st.sT=.28;st.steam.push({x:192+Math.random()*52,y:136,t0:st.t,s:1});}},
    draw(t){BS.rail(K);
      // the bucket she bleeds into, the pot she goes into
      g.drawImage(BK.bucket(),75,146);if(st.blood>0){K.ell(92,150,10*st.blood+2,1.6,P[2]);K.px(86,149,4,1,P[4]);}
      const dy=Math.round(st.dunk*50),hx=Math.round(st.x);BS.hook(K,hx,15,14+dy);g.drawImage(BS.henHang(st.wet?'w':'f'),hx-24,16+dy);
      if(st.ph==='bleed'||st.ph==='move'){K.px(hx,16+dy+86,1,2,P[3]);if(st.ph==='bleed')BS.drip(K,hx,16+88,148,st.t,.42,P);}
      BS.pot(K,g,176,134);BS.steam(K,st.steam,st.t);
      if(st.dunk>.5){for(const [x,y] of [[196,134],[242,135],[206,131],[232,131]])K.px(x+Math.round(Math.sin(t*20+x)*1),y,2,1,BS.WAT[4]);}
      // the left fist on the rope, lowering her
      if(st.ph!=='bleed')m4grip(K,hx-1,4+dy*.6+20,1.57,{side:-1});},
    hud(){if(st.ph==='bleed'||st.ph==='move')return;const x=300,y0=40,h=60;K.px(x-2,y0-2,8,h+4,'#1a0e06');K.px(x-1,y0-1,6,h+2,'#7a4a20');K.px(x,y0,4,h,'#2a1a0e');
      const b0=Math.round(h*BAND[0]/MAX),b1=Math.round(h*BAND[1]/MAX);K.px(x,y0+h-b1,4,b1-b0,'#3a6a2a');const f=Math.round(h*Math.min(1,st.under/MAX));
      if(st.ph==='under'||st.ph==='out')K.px(x,y0+h-f,4,f,st.under>BAND[1]?'#c8502a':st.under>=BAND[0]?'#8ad06a':'#d8b04a');K.px(x-3,y0+h-b1,10,1,'#e8f0c0');K.px(x-3,y0+h-b0,10,1,'#e8f0c0');
      K.label('DUNK',x+2,y0-10,'#f4ecd8');K.meter(st.ph==='out'?1:0,st.score);},
    auto(dt,AP){const a=m4ai(this,AP,dt);m4hold(a,st.ph==='ready'||(st.ph==='under'&&st.under<1.8));AP.hand=[219,60];AP.press=a.down;}};};
// ---------------------------------------------------------------- pluck her by the handful, then cut her down off her feet
S4.hnPluck=(sp,K)=>{const g=K.g,full=BS.full(),P=full?BG71.BL:BG71.BLT,HX=160,OX=HX-24,OY=16;BK.warm([()=>{BS.henHang('p');BS.henPatches();BK.hatchet(0);M4S.pot();}]);
  const HP=BS.henPatches(),N=HP.C.length;
  const st={t:0,ph:'pluck',i:0,T:BS.tug(),tears:[],away:[],fl:[],stuck:0,glance:0,chopU:0,swing:-1,fall:-1,steam:[],score:1,last:0};
  const dirOf=i=>{const [cx,cy]=HP.C[i],dx=cx-24,dy=cy-44,n=Math.hypot(dx,dy)||1;return [dx/n,dy/n];};
  return {title:'Pluck her',how:'Hold to grip a handful and pull. You’ll hear it give: let go then. Hang on too long and the skin tears; let go too soon and it stays.',hint:'Pull, feel it give, let go.',st,
    update(dt,I){st.t+=dt;
      if(st.ph==='pluck'){const r=BS.tugUp(st.T,dt,I);
        if(r==='ok'){const [ux,uy]=dirOf(st.i),[cx,cy]=HP.C[st.i];st.away.push({i:st.i,t0:st.t});BS.snd.pluck();BS.snd.tear(.4);st.stuck++;
          for(let k=0;k<3;k++)st.fl.push({x:OX+cx+ux*8+(k-1)*3,y:OY+cy+uy*8,vx:(Math.random()-.5)*14+ux*8,vy:22+Math.random()*10,ph:Math.random()*6,t0:st.t,land:150});
          st.i++;K.judge(1,252,50,true);if(st.i>=N){st.ph='end';st.ft=st.t;}}
        else if(r==='tear'){const [cx,cy]=HP.C[st.i];st.tears.push([cx,cy]);BS.snd.tear(1);K.judge(.2,252,50,true);MS.miss&&MS.miss();K.shk=Math.max(K.shk,.05);}
        else if(r==='back'){MS.miss&&MS.miss();}}
      else if(st.ph==='feet'){st.chopU=Math.max(0,st.chopU-dt*4);
        if(st.swing<0&&(I.pressed||(I.down&&!st.wasDown)))st.swing=0;
        if(st.swing>=0){st.swing+=dt/.1;if(st.swing>=1){st.swing=-1;st.chopU=1;const r=BS.ring(st.t-st.ft);BK.snd.chop();K.shk=Math.max(K.shk,.1);
            if(r<=5.5){st.ph='drop';st.fall=st.t;BG71.snd.crack();K.judge(1,252,50,true);}else{st.glance++;K.judge(.2,252,50,true);MS.miss&&MS.miss();}}}}
      else if(st.ph==='end'){if(st.t-st.ft>.9){st.done=true;st.score=Math.max(.5,1-.08*st.tears.length);BS.after().feathers=st.stuck;}}
      st.wasDown=I.down;st.sT=(st.sT||0)-dt;if(st.sT<=0){st.sT=.5;st.steam.push({x:OX+10+Math.random()*28,y:OY+50,t0:st.t,s:.6});}},
    draw(t){BS.rail(K);const fallY=st.ph==='drop'?Math.round(((st.t-st.fall)*2.4)**2*60):0;
      BS.hook(K,HX,15,14);
      // the feet stay on the hook; the rest of her falls once they're cut
      if(st.ph==='drop'){g.drawImage(BS.cutRows('bshenfeet',BS.henHang('p'),0,21),OX,OY);g.drawImage(BS.cutRows('bshenbody',BS.henHang('p'),21,90),OX,OY+21+fallY);}
      else{g.drawImage(BS.henHang('p'),OX,OY);
        for(const [x,y] of st.tears){const X=OX+x,Y=OY+y;K.px(X-2,Y,5,1,P[0]);K.px(X-1,Y-1,3,1,full?BT3.MEAT[5]:P[2]);K.px(X-1,Y+1,3,1,P[2]);K.px(X+1,Y+2,1,3,P[3]);}
        const ten=BS.tense(st.T);for(let i=0;i<N;i++){if(i<st.i)continue;let ox=0,oy=0;if(i===st.i&&st.T.down){const [ux,uy]=dirOf(i);ox=Math.round(ux*ten*4);oy=Math.round(uy*ten*4);}g.drawImage(HP.cv[i],OX+ox,OY+oy);}}
      for(const a of st.away){const e=st.t-a.t0;if(e>.3)continue;const [ux,uy]=dirOf(a.i);g.drawImage(HP.cv[a.i],Math.round(OX+ux*(6+e*60)),Math.round(OY+uy*(6+e*60)+e*e*80));}
      if(full){const pq=Math.min(10,2+Math.round(st.t*.8));const im=BK.flat(61,pq,9,true);g.drawImage(im,Math.round(HX-im.width/2+4),Math.round(160-im.height/2));BS.drip(K,HX,OY+88,158,st.t,.6,P);K.px(HX,OY+84,1,4,P[3]);}
      BS.heap(K,HX-4,168,Math.min(1,st.i/N));for(const f of st.fl){if(st.t-f.t0<(f.land-f.y)/f.vy)BS.feather(K,f,st.t);}BS.steam(K,st.steam,st.t);
      // your fists: the left holds her by the legs; the right is in her feathers, or on the hatchet at the end
      if(st.ph==='pluck'){const [cx,cy]=HP.C[Math.min(N-1,st.i)],[ux,uy]=dirOf(Math.min(N-1,st.i)),ten=st.T.down?BS.tense(st.T):0,fx=OX+cx+ux*(5+ten*6),fy=OY+cy+uy*(5+ten*6);
        m4grip(K,HX-5,OY+22,1.57,{side:-1});m4grip(K,fx,fy,.35,{side:1});BS.featherOnFist(K,fx,fy,st.stuck);}
      else if(st.ph==='feet'){const r=BS.ring(st.t-st.ft);BS.drawRing(K,HX,OY+20,r);m4grip(K,HX+2,OY+52,.35,{side:1});const u=st.swing>=0?st.swing**2:st.chopU;BS.hatchet(K,HX,OY+20,u,0);}
      else{const u=Math.max(0,1-(st.t-st.fall)*3);BS.hatchet(K,HX,OY+20,u,0);}},
    hud(){K.label('HANDFUL '+Math.min(N,st.i+1)+'/'+N,30,20,'#f4ecd8','l');K.meter(st.i/N,Math.max(.5,1-.08*st.tears.length));},
    auto(dt,AP){if(st.ph==='pluck'){const a=BS.tugAuto(this,st.T,AP,dt);AP.hand=[OX+HP.C[Math.min(N-1,st.i)][0],OY+HP.C[Math.min(N-1,st.i)][1]];AP.press=a.down;return;}
      const a=m4ai(this,AP,dt);if(st.ph==='feet'&&st.swing<0&&st.t-st.ft>.4){const r=BS.ring(st.t-st.ft+.1);if(r<3.5&&r>.5)m4tap(a);}AP.hand=[HX,OY+20];AP.press=a.down;}};};
// ---------------------------------------------------------------- the hen's insides: drawn small and wet, one piece at a time
BS.giz=()=>BG71.spr('bsgiz1',14,11,[{t:'dome',cx:7,cy:5.5,rx:6.4,ry:5,top:4,P:BG71.GIZ,base:2.8,gain:3.2,glint:BG71.GIZ[5],gl:.9}],(K)=>{K.px(4,5,6,1,'#c8ccd8');K.px(4,4,4,1,'#9aa0b4');},'#1a0810');
BS.liverS=()=>BG71.spr('bsliv1',16,9,[{t:'dome',cx:5,cy:4.5,rx:4.6,ry:3.6,top:3,P:BG71.LIV,base:2.8,gain:3,glint:BG71.LIV[5],gl:.88},{t:'dome',cx:11,cy:5,rx:4.4,ry:3.4,top:3,z:.4,P:BG71.LIV,base:2.4,gain:3}],null,'#12040a');
BS.heartS=()=>BG71.spr('bsheart1',8,9,[{t:'dome',cx:4,cy:5,rx:3.4,ry:3.8,top:3,P:BG71.MH,base:2,gain:3}],(K)=>{K.px(2,1,4,2,BT3.FAT[2]);K.px(2,1,2,1,BT3.FAT[4]);},'#1a0408');
BS.cropS=()=>BG71.spr('bscrop1',11,9,[{t:'dome',cx:5.5,cy:4.5,rx:4.8,ry:3.8,top:3,P:['#5a4a3a','#8a7660','#b8a488','#dccab0','#f0e4cc'],base:2.6,gain:3}],(K)=>{for(const [x,y] of [[3,4],[6,3],[7,6],[4,6]])K.px(x,y,1,1,'#c89a3a');},'#2a1e14');
// one of them coming out of the opening: strands of membrane between it and the edge, stretched as you pull, snapping when it gives
BS.strands=(K,x0,y0,x1,y1,ten,P)=>{for(const o of [-2,0,2]){const n=Math.ceil(Math.hypot(x1-x0,y1-y0));for(let i=0;i<n;i+=1){const u=i/n,x=Math.round(x0+(x1-x0)*u+o*(1-ten*.6)*Math.sin(u*Math.PI)),y=Math.round(y0+(y1-y0)*u);if((i+o)%3)K.px(x,y,1,1,'#e4c8c0');}}};
// the bird on the block, where her feet come off and she's opened, drawn and rinsed
const BH={};
BH.X=82;BH.Y=58;
// her knuckles (where the feet come off) and her vent, found on the dressed bird's own picture
BH.find=()=>{if(BH._f)return BH._f;const im=BT3.hen(),w=im.width,h=im.height,d=im.getContext('2d').getImageData(0,0,w,h).data,op=(x,y)=>d[(y*w+x)*4+3]>128;
  const low=(x0,x1)=>{for(let y=h-1;y>=0;y--)for(let x=x0;x<x1;x++)if(op(x,y))return [x,y];return [0,0];};let vy=h-1;while(vy>0&&!op(78,vy))vy--;
  return BH._f={kl:low(0,60),kr:low(96,w),vent:[78,vy-5],neck:[78,6]};};
BS.henFoot=()=>BG71.spr('bshfoot1',16,22,[{t:'tube',pts:[[8,2],[8,12]],r0:2.2,r1:1.8,P:BG71.BEAK,base:2.6,gain:3},{t:'tube',pts:[[8,12],[2,19]],r0:1.3,r1:.8,z:1,P:BG71.BEAK,base:2.4,gain:3},
  {t:'tube',pts:[[8,12],[8,21]],r0:1.3,r1:.8,z:1.2,P:BG71.BEAK,base:2.2,gain:3},{t:'tube',pts:[[8,12],[14,19]],r0:1.3,r1:.8,z:1,P:BG71.BEAK,base:2,gain:3},{t:'tube',pts:[[8,8],[11,6]],r0:1,r1:.6,z:1,P:BG71.BEAK,base:2.4,gain:3}],
  (K)=>{K.px(6,1,4,2,BG71.RAW[3]);K.px(7,1,1,1,'#ece0c8');K.px(9,2,1,1,BG71.RAW[1]);for(const y of [5,8,11])K.px(7,y,2,1,BG71.BEAK[1]);},'#3a2010');
// her guts drawn out: short lengths, tapered, swelling and narrowing, a dark wet crease where one lies over another, each with its own
// rim of blood
BS.hguts=()=>BG71.spr('bshguts3',50,40,(()=>{const pts=[[40,4],[34,10],[26,12],[20,8],[13,11],[10,19],[15,25],[25,24],[31,29],[25,35],[12,34],[4,30]],S=[];
  for(let i=0;i+1<pts.length;i++){const r=3.6+Math.sin(i*1.9)*1.3-i*.1;S.push({t:'tube',pts:[pts[i],pts[i+1]],r0:Math.max(1.8,r),r1:Math.max(1.6,r-1.1),z:i*1.4,P:BG71.GUT,base:2.9+(i%2)*.3,gain:3.2,glint:BG71.GUT[5],gl:.9});}return S;})(),
  (K)=>{const B=BG71.BL;for(const [x,y,w] of [[30,15,4],[16,15,3],[20,28,4],[8,37,5],[28,33,3]]){K.px(x,y,w,1,B[3]);K.px(x,y+1,w-1,1,B[1]);}},'#3a0812');
S4.hnGut=(sp,K)=>{const g=K.g,full=BS.full(),P=full?BG71.BL:BG71.BLT;BK.warm([()=>{BT3.hen();BH.find();BS.henFoot();BS.hguts();BS.giz();BS.liverS();BS.heartS();BS.cropS();M4S.bowl();BK.hatchet(1);}]);
  const f=BH.find(),KN=[[BH.X+f.kl[0],BH.Y+f.kl[1]],[BH.X+f.kr[0],BH.Y+f.kr[1]]],VENT=[BH.X+f.vent[0],BH.Y+f.vent[1]],NECK=[BH.X+f.neck[0],BH.Y+f.neck[1]];
  const PATH=[[VENT[0]-10,VENT[1]-1],[VENT[0],VENT[1]+2],[VENT[0]+10,VENT[1]-1]];
  const o=S4.trace(Object.assign({},sp,{surface:'vent',tool:'knife',paths:[PATH.map(p=>p.slice())]}),K);const st=o.st;
  const G={t:0,ph:'feet',fi:0,f0:0,swing:-1,chopU:0,glance:0,nicks:[],off:[],T:BS.tug(),i:0,tears:[],out:[],score:1,cutDone:-1};
  const PULL=[{at:VENT,to:VENT,name:'guts'},{at:VENT,to:BK.X()?[244,142]:[250,150],name:'giblets'},{at:NECK,to:[66,94],name:'crop'}];
  const up=o.update;o.update=function(dt,I){G.t+=dt;G.chopU=Math.max(0,G.chopU-dt*4);
    if(G.ph==='feet'){if(G.swing<0&&(I.pressed||(I.down&&!G.wasDown)))G.swing=0;G.wasDown=I.down;
      if(G.swing>=0){G.swing+=dt/.1;if(G.swing>=1){G.swing=-1;G.chopU=1;BK.snd.chop();K.shk=Math.max(K.shk,.08);const r=BS.ring(G.t-G.f0);
          if(r<=5.5){BG71.snd.crack();G.off.push({i:G.fi,t0:G.t});K.judge(1,252,50,true);G.fi++;G.f0=G.t;if(G.fi>=2){G.ph='cut';}}
          else{G.glance++;G.nicks.push(KN[G.fi].slice());K.judge(.2,252,50,true);MS.miss&&MS.miss();}}}return;}
    if(G.ph==='cut'){up.apply(this,arguments);if(st.done){st.done=false;G.cutScore=st.score;G.ph='draw';G.openT=G.t;BG71.snd.squish(1);}return;}
    if(G.ph==='draw'){const r=BS.tugUp(G.T,dt,I);if(r==='ok'){G.out.push({i:G.i,t0:G.t});BS.snd.tear(.6);if(G.i===0){BG71.snd.slop();BS.after().henOut=performance.now()/1000;}if(G.i===1)BS.after().gibOut=1;G.i++;K.judge(1,252,50,true);if(G.i>=PULL.length){G.ph='end';G.endT=G.t;}}
      else if(r==='tear'){G.tears.push({i:G.i,t0:G.t});BS.snd.tear(1.2);K.judge(.2,252,50,true);MS.miss&&MS.miss();}else if(r==='back')MS.miss&&MS.miss();}
    if(G.ph==='end'&&G.t-G.endT>.9&&!st.done){st.done=true;st.score=Math.max(.5,(G.cutScore||1)-.12*G.tears.length-.08*G.glance);const af=BS.after();af.henGutted=1;af.henSpoil=G.tears.length;}};
  const piece=(K,i,x,y)=>{x=Math.round(x);y=Math.round(y);if(!full){K.px(x-6,y-3,12,7,P[1]);K.px(x-5,y-2,10,5,P[2]);return;}
    if(i===0)g.drawImage(BS.hguts(),x-40,y-4);else if(i===1){g.drawImage(BS.giz(),x-12,y-5);g.drawImage(BS.liverS(),x+1,y-4);g.drawImage(BS.heartS(),x-4,y+2);}else g.drawImage(BS.cropS(),x-5,y-4);};
  const foot=(k,dx,dy,da)=>{const [kx,ky]=KN[k],s=k?-1:1;M4.rot(g,BS.henFoot(),kx+dx,ky+dy,s*.55+da,8,2);};
  const d0=o.draw;o.draw=function(t){BKH.scene(K,g);g.drawImage(M4S.bowl(),BK.X()?214:220,BK.X()?132:140);
    // the blood she still has in her, on the board under the vent, and spreading once she's opened
    const opened=G.ph!=='feet'&&(G.ph!=='cut'||st.end),pq=opened?Math.min(10,4+Math.round((G.t-(G.openT||G.t))*3)):3;
    {const im=BK.flat(71,pq,16,full);g.drawImage(im,Math.round(VENT[0]-im.width/2-6),Math.round(VENT[1]+8-im.height/2));}
    // the feet, on her or chopped off and lying on the board
    for(let k=0;k<2;k++){const e=G.off.find(o=>o.i===k);if(!e)foot(k,0,0,0);else{const a=Math.min(1,(G.t-e.t0)*5),s=k?1:-1;foot(k,s*-22*a,11*a,s*-1.1*a);}}
    g.drawImage(BT3.hen(),BH.X,BH.Y);
    for(const e of G.off){const [kx,ky]=KN[e.i];K.px(kx-2,ky-1,4,3,full?BG71.RAW[3]:P[2]);K.px(kx-1,ky-1,2,1,full?BG71.RAW[4]:P[2]);K.px(kx-2,ky,1,1,'#ece0c8');if(full){K.px(kx-1,ky+2,2,3,P[3]);K.px(kx-1,ky+5,2,1,P[1]);}}
    for(const [x,y] of G.nicks){K.px(x-3,y-3,5,1,P[0]);K.px(x-2,y-4,3,1,full?BG71.RAW[4]:P[2]);}
    // the vent, opened: ragged, dark inside, raw at its lips, blood welling at the lower one
    if(opened){const [vx,vy]=VENT;K.px(vx-9,vy-2,19,5,full?BG71.CAV[1]:P[0]);K.px(vx-7,vy-1,14,3,full?BG71.CAV[0]:P[0]);
      for(let x=vx-9;x<=vx+9;x++){const j=(x*7)%3;K.px(x,vy-3+(j===1?1:0),1,1,full?BG71.MH[2]:P[2]);K.px(x,vy+3-(j===2?1:0),1,1,full?BG71.MH[0]:P[1]);}
      if(full){K.px(vx-4,vy+3,6,2,P[3]);K.px(vx-3,vy+3,2,1,P[4]);K.px(vx-1,vy+5,2,4,P[3]);}}
    // what's already out: the guts on the board, the giblets in the bowl, the crop thrown aside; a burst one leaves its mess
    for(const e of G.out){const p=PULL[e.i],a=Math.min(1,(G.t-e.t0)*3),x=p.at[0]+(p.to[0]-p.at[0])*a,y=p.at[1]+(p.to[1]-p.at[1])*a-Math.sin(a*Math.PI)*10;piece(K,e.i,x,y);}
    for(const e of G.tears){const p=PULL[e.i],[x,y]=p.at;const c=e.i===1?['#2a3a14','#4a6a1e','#7a9a3a']:e.i===2?['#5a4a2a','#a88a4a','#d8b86a']:['#2a2010','#4a3a1a','#6a5a2a'];
      if(!full)continue;K.px(x-8,y+3,14,3,c[1]);K.px(x-6,y+3,6,1,c[2]);K.px(x-9,y+5,5,1,c[0]);K.px(x+3,y+6,4,1,c[0]);}
    if(G.ph==='draw'){const p=PULL[G.i],ten=G.T.down?BS.tense(G.T):0,[ax,ay]=p.at,dx=p.to[0]-ax,dy=p.to[1]-ay,n=Math.hypot(dx,dy)||1,x=ax+dx/n*(3+ten*10),y=ay+dy/n*(3+ten*10);
      if(G.T.down&&full)BS.strands(K,ax,ay,x,y,ten,P);if(G.T.down)piece(K,G.i,x,y);m4grip(K,x+dx/n*4,y+dy/n*4,Math.atan2(dy,dx),{side:1});}
    if(G.ph==='end'){const a=Math.min(1,(G.t-G.endT)*2);m4grip(K,180+a*30,70-a*20,.35,{side:1});}
    if(G.ph==='feet'){const [kx,ky]=KN[Math.min(1,G.fi)];BS.drawRing(K,kx,ky,BS.ring(G.t-G.f0));m4grip(K,160,90,.35,{side:1});BS.hatchet(K,kx,ky,G.swing>=0?G.swing**2:G.chopU,full?1:0);}
    if(G.ph==='cut'){for(let s2=st.s;s2<m4len(PATH);s2+=3){const [x,y]=m4at(PATH,s2);K.px(x,y,2,1,'#fff0d0');K.px(x+2,y,1,1,'#2a0e08');}
      for(let s2=0;s2<Math.min(st.s,m4len(PATH));s2+=1){const [x,y]=m4at(PATH,s2);K.px(x,y,1,1,P[0]);K.px(x,y+1,1,1,P[3]);}
      if(!st.end){const ka=Math.PI-.62;M4.rot(g,M4S.knife(),st.tx,st.ty,ka,8,44);const [hx,hy2]=M4.tr(st.tx,st.ty,ka,-.5,-36.5);m4grip(K,hx,hy2,ka-Math.PI/2,{side:1});}
      m4grip(K,120,96,.35,{side:-1});if(!st.end&&st.s<2){const [sx,sy]=PATH[0];K.pa(sx-3,sy-3,7,7,'#ffd27a',.5+Math.sin(t*10)*.3);}}};
  o.title='Feet off, and draw her';o.how='Strike when the ring closes on each knuckle to take her feet off. Then make a short cut across the vent ('+(K.fine?'hold the mouse button and draw along the dotted line':'drag along the dotted line')+'), reach in, and hold to draw out each part, letting go when you hear it come free: the guts, then the heart, the liver and the gizzard for the bowl, and last the crop at her neck.';o.hint='Strike on the ring. Then pull, feel it give, let go.';
  const au=o.auto;o.auto=function(dt,AP){if(G.ph==='feet'){const a=m4ai(this,AP,dt);if(G.swing<0&&G.t-G.f0>.4){const r=BS.ring(G.t-G.f0+.1);if(r<3.5&&r>.5)m4tap(a);}AP.hand=KN[Math.min(1,G.fi)].slice();AP.press=a.down;return;}
    if(G.ph==='draw'){const a=BS.tugAuto(this,G.T,AP,dt);AP.hand=PULL[G.i].at.slice();AP.press=a.down;return;}if(G.ph==='end'){const a=m4ai(this,AP,dt);m4hold(a,false);AP.press=false;return;}return au.apply(this,arguments);};
  const hd=o.hud;o.hud=function(){if(G.ph==='feet'){K.label('FEET '+Math.min(2,G.fi+1)+'/2',30,20,'#f4ecd8','l');K.meter(0,1);return;}if(G.ph!=='cut'){K.label('DRAW '+Math.min(PULL.length,G.i+1)+'/'+PULL.length,30,20,'#f4ecd8','l');K.meter(G.i/PULL.length,Math.max(.5,(G.cutScore||1)-.12*G.tears.length));return;}return hd&&hd.apply(this,arguments);};
  return o;};
// ---------------------------------------------------------------- rinse her in the basin until the water runs clear
S4.hnRinse=(sp,K)=>{const g=K.g,full=BS.full(),P=full?BG71.BL:BG71.BLT;BK.warm([()=>{BT3.hen();M4S.jug();}]);
  const st={t:0,p:0,pour:0,done:false,score:1,endT:-1,spl:[],pT:0};
  const red=()=>full?(st.p<.32?.55+st.p/.32*.45:Math.max(0,1-(st.p-.32)/.62)):(st.p<.32?.5:Math.max(0,.5-(st.p-.32)));
  return {title:'Rinse her',how:'Hold to pour the jug over her, inside and out. The water in the basin runs pink, then clear; keep going until it’s clear.',hint:'Hold to pour until the water runs clear.',st,
    update(dt,I){st.t+=dt;const d=!!I.down&&st.endT<0;st.pour+=((d?1:0)-st.pour)*Math.min(1,dt*8);
      if(d){st.p=Math.min(1,st.p+dt/2.8);st.pT-=dt;if(st.pT<=0){st.pT=.38;BS.snd.pour();}}if(I.pressed&&st.endT<0)st.p=Math.min(1,st.p+.03);
      if(st.p>=1&&st.endT<0){st.endT=st.t;K.judge(1,252,50,true);BS.snd.splash(.6);}if(st.endT>=0&&st.t-st.endT>.9)st.done=true;},
    draw(t){BKH.scene(K,g);const k=red(),WT=BS.WAT.map(c=>BS.tint(c,k));
      // the tin basin, the water in it, her in the water, the basin's front
      const bx=66,by=112,bw=188;K.pa(bx+4,by+56,bw,6,'#000',.3);K.ell(bx+bw/2,by+14,bw/2,14,'#5a5e66');K.ell(bx+bw/2,by+15,bw/2-3,12,'#2a2e36');K.ell(bx+bw/2,by+17,bw/2-6,10,WT[2]);K.px(bx+30,by+12,26,1,WT[4]);
      g.drawImage(BT3.hen(),BH.X,BH.Y+4);
      // what's left of the blood on her fades as you pour
      if(st.p<1){const a=(1-st.p)*(full?.85:.5);g.globalAlpha=a;K.px(152,138,18,5,P[3]);K.px(156,143,8,6,P[2]);K.px(150,66,20,4,P[3]);K.px(122,100,6,10,P[2]);g.globalAlpha=1;}
      K.px(bx,by+28,bw,22,'#6a6e76');K.px(bx,by+28,bw,1,'#a8acb4');K.px(bx,by+30,bw,1,'#3a3e46');K.px(bx+2,by+48,bw-4,2,'#3a3e46');for(let x=bx+14;x<bx+bw;x+=34)K.px(x,by+31,1,17,'#585c64');
      // running over the lip, pink and then clear
      if(st.p>.08){const n=Math.min(18,Math.round(st.p*40));for(const x of [bx+44,bx+120]){for(let i=0;i<n;i++)K.px(x+(i>8?1:0),by+28+i,2,1,WT[3]);K.px(x,by+28,1,n,WT[4]);}}
      // the jug in your fist, tipping as you pour; the water falling on her
      const tilt=-.15-st.pour*.9,jx=218,jy=40;M4.rot(g,M4S.jug(),jx,jy,tilt,20,20);const sx=jx+Math.cos(tilt+Math.PI*1.12)*20,sy=jy+Math.sin(tilt+Math.PI*1.12)*20;
      if(st.pour>.4&&st.endT<0){BS.water(K,[[sx,sy],[sx-6,sy+16],[sx-14,sy+36],[sx-18,sy+56]],3,0);for(let i=0;i<3;i++)K.px(Math.round(sx-20+Math.sin(t*30+i)*5),Math.round(sy+56+i),2,1,BS.WAT[4]);}
      m4grip(K,jx+14,jy+4,tilt,{side:1});m4grip(K,120,96,.35,{side:-1});},
    hud(){K.label('RINSE',30,20,'#f4ecd8','l');K.meter(st.p,1);},
    auto(dt,AP){const a=m4ai(this,AP,dt);m4hold(a,st.endT<0);AP.hand=[200,70];AP.press=a.down;}};};

// ================================================================ the cow
const BC={LY:-10};
BC.at=(g,n,dx,dy)=>BK.at(g,n,dx||0,(dy||0)+BC.LY);
// where the bleed-out left things: her shadow, the pool round the bucket, the bucket run over
BC.floor=(K,g,full,P)=>{K.pa(56,146,244,12,'#0a0604',.3);const q=Math.max(6,Math.round((BS.after().cowPool||.85)*10));const im=BK.flat(41,q,27,full);g.drawImage(im,Math.round(103-im.width/2),Math.round(168-im.height/2));
  g.drawImage(BK.bucket(),86,137);K.ell(103,141,13,2,full?P[2]:P[1]);K.ell(103,140,9,1,full?P[3]:P[2]);if(full){BK.spill(K,94,143,25,0,99,14,P);BK.spill(K,109,144,12,0,99,9,P);}};
// a raw cut face: a ragged rim, the meat, a pale block of bone to one side (no rings)
BC.stump=(K,x,y,h,full,P)=>{x=Math.round(x);y=Math.round(y);const M=BT3.MEAT;for(let i=0;i<h;i++){const u=i/(h-1),w=2+Math.round(Math.sin(u*Math.PI)*4)+((i*7)%5===1?1:0);
    K.px(x-w,y+i,1,1,P[0]);for(let k=-w+1;k<w;k++)K.px(x+k,y+i,1,1,full?((i+k*2)%9===4?M[2]:k<-w/3?M[5]:M[4]):P[2]);K.px(x+w,y+i,1,1,full?M[1]:P[1]);}
  if(full){const by=y+Math.round(h*.28);K.px(x-3,by,4,4,'#ece0c8');K.px(x-3,by,4,1,'#fff6e0');K.px(x-1,by+2,1,2,'#8a6a58');K.px(x+1,y+Math.round(h*.7),2,2,'#3a0c10');}};
BC.face=(K,x,y,h,full,P,bone)=>{x=Math.round(x);y=Math.round(y);const M=BT3.MEAT;for(let i=0;i<h;i++){const w=2+Math.round(Math.sin(i/h*Math.PI)*2)+(i%3===1?1:0);K.px(x-w,y+i,1,1,P[0]);K.px(x-w+1,y+i,w*2-2,1,full?(i%4===2?M[3]:M[4]):P[2]);K.px(x+w-1,y+i,1,1,full?M[2]:P[1]);}
  if(full&&bone){const by=y+Math.round(h*.25);K.px(x-1,by,3,2,'#ece0c8');K.px(x,by+1,1,1,'#8a6a58');}};
// ---------------------------------------------------------------- off with her head and her shanks: three chops at the joints
S4.cwHead=(sp,K)=>{const g=K.g,full=BS.full(),P=full?BG71.BL:BG71.BLT;BK.warm([()=>{for(const n of ['cowBodyB','cowHeadB','cowShankF','cowThighH','cowShankH'])BK.img(n);BK.hatchet(1);BK.wall();}]);
  const J=[{x:116,y:104,name:'head',d:[-22,8]},{x:152,y:147,name:'knees',d:[-7,13]},{x:274,y:142,name:'hocks',d:[15,9],right:1}];
  const PT=[];{const L=Math.floor(m4len(BKC.TPATH));for(let j=0;j<=L;j++)PT.push(m4at(BKC.TPATH,j));}
  const st={t:0,i:0,j0:0,swing:-1,chopU:0,glance:0,nicks:[],off:[],cutT:0,score:1,endT:-1};
  const sep=i=>{const e=st.off.find(o=>o.i===i);if(!e)return 0;return Math.min(1,(st.t-e.t0)*4);};
  return {title:'Head and shanks',how:'Take off her head, then her legs at the knees and the hocks. A ring closes on each joint: strike when it’s tight. A bad blow only bites, and you strike again.',hint:'Strike when the ring is tight.',st,
    update(dt,I){st.t+=dt;st.cutT=Math.max(0,st.cutT-dt);st.chopU=Math.max(0,st.chopU-dt*4);
      if(st.endT>=0){if(st.t-st.endT>.8){st.done=true;st.score=Math.max(.5,1-.1*st.glance);BS.after().cowHeadOff=1;}return;}
      if(st.swing<0&&(I.pressed||(I.down&&!st.wasDown)))st.swing=0;
      if(st.swing>=0){st.swing+=dt/.1;if(st.swing>=1){st.swing=-1;st.chopU=1;const j=J[st.i],r=BS.ring(st.t-st.j0);BK.snd.chop();K.shk=Math.max(K.shk,.12);if(!full)st.cutT=.6;
          if(r<=5.5){BG71.snd.crack();st.off.push({i:st.i,t0:st.t});K.judge(1,252,60,true);st.i++;st.j0=st.t;if(st.i>=J.length)st.endT=st.t;}
          else{st.glance++;st.nicks.push([j.x+(Math.random()*6-3),j.y+(Math.random()*6-3)]);K.judge(.2,252,60,true);MS.miss&&MS.miss();}}}
      st.wasDown=I.down;},
    draw(t){if(BK.cut(K,g,st))return;BC.floor(K,g,full,P);const show=i=>full||!st.off.some(o=>o.i===i);
      const dH=sep(0),dK=sep(1),dX=sep(2);
      if(show(2))BC.at(g,'cowShankH',J[2].d[0]*dX,J[2].d[1]*dX);BC.at(g,'cowThighH');BC.at(g,'cowBodyB');if(show(1))BC.at(g,'cowShankF',J[1].d[0]*dK,J[1].d[1]*dK);
      if(show(0)){const hx=J[0].d[0]*dH,hy=J[0].d[1]*dH,ang=.3*dH,pvx=112,pvy=118;g.save();g.translate(pvx+hx,pvy+hy);g.rotate(ang);g.translate(-pvx,-pvy);BC.at(g,'cowHeadB');BK.lieEye(K,5,BC.LY);BK.tongue(K,BC.LY);
        if(dH>0)BC.stump(K,110,90,30,full,P);g.restore();}
      if(!st.off.some(o=>o.i===0))BK.gash(K,PT,PT.length,1.6,full,P,0);
      // the cut faces, once a joint is through
      if(st.off.some(o=>o.i===0)){if(full){const im=BK.flat(83,Math.min(10,3+Math.round(sep(0)*7)),16,true);g.drawImage(im,Math.round(112-im.width/2),Math.round(140-im.height/2));for(let i=0;i<14;i++)K.px(117+(i>7?1:0),126+i,2,1,P[3]);}
        BC.stump(K,116,92,34,full,P);if(!full){BK.smear(K,108,120);BK.smear(K,104,128);}}
      if(st.off.some(o=>o.i===1)){BC.face(K,151,150,6,full,P,1);BC.face(K,140,154,5,full,P,0);const [dx,dy]=J[1].d;BC.face(K,156+dx,151+dy,5,full,P,1);BC.face(K,145+dx,156+dy,4,full,P,1);if(!full)BK.smear(K,146,158);}
      if(st.off.some(o=>o.i===2)){BC.face(K,276,144,6,full,P,1);BC.face(K,264,152,5,full,P,0);const [dx,dy]=J[2].d;BC.face(K,280+dx,146+dy,5,full,P,1);BC.face(K,268+dx,154+dy,4,full,P,1);if(!full)BK.smear(K,270,154);}
      for(const [x,y] of st.nicks){K.px(Math.round(x)-2,Math.round(y),5,1,P[0]);K.px(Math.round(x)-1,Math.round(y)-1,3,1,full?BT3.MEAT[5]:P[2]);}
      // your other fist on her, holding her still; the hatchet
      m4grip(K,188,96,.35,{side:1});
      const hat=(j,u)=>{if(j.right){g.save();g.translate(j.x,0);g.scale(-1,1);g.translate(-j.x,0);BS.hatchet(K,j.x,j.y,u,full?1:0);g.restore();}else BS.hatchet(K,j.x,j.y,u,full?1:0);};
      if(st.endT<0){const j=J[st.i];BS.drawRing(K,j.x,j.y,BS.ring(st.t-st.j0));hat(j,st.swing>=0?st.swing**2:st.chopU);}
      else hat(J[2],Math.max(0,1-(st.t-st.endT)*3));},
    hud(){K.label('CHOP '+Math.min(3,st.i+1)+'/3',30,20,'#f4ecd8','l');K.meter(st.i/3,Math.max(.5,1-.1*st.glance));},
    auto(dt,AP){const a=m4ai(this,AP,dt);if(st.endT<0&&st.swing<0&&st.t-st.j0>.4){const r=BS.ring(st.t-st.j0+.1);if(r<3.5&&r>.5)m4tap(a);}const j=J[Math.min(2,st.i)];AP.hand=[j.x,j.y];AP.press=a.down;}};};
// the hide off her in one piece, spread on the boards, the fat side up, the hair showing at its edge
BS.hideSheet=()=>M4.pre('bs_hide2',150,40,(K,g,w,h)=>{const poly=[[30,10],[52,7],[58,1],[66,6],[96,5],[104,0],[112,6],[134,8],[146,4],[148,12],[138,18],[140,28],[148,34],[136,38],[112,32],[96,38],[60,37],[40,39],[26,34],[16,38],[4,34],[14,26],[10,16],[2,10],[12,6]];
  const inn=(x,y)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c;}return c;};
  const Hd=['#4a2220','#7a3e2a','#a8663a','#cc8f50','#ecc58a'],Hs=(a,b)=>{let v=(a*374761393+b*668265263)|0;v=(v^(v>>>13))*1274126177|0;return((v^(v>>>16))>>>0)/4294967295;};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(!inn(x+.5,y+.5))continue;const e=!inn(x-.5,y+.5)||!inn(x+1.5,y+.5)||!inn(x+.5,y-.5)||!inn(x+.5,y+1.5);
    if(e){K.px(x,y,1,1,y<8?'#f0c8b8':'#c46a60');continue;}const v=(1-y/h)*.55+(1-x/w)*.25+Math.sin(x*.21+y*.4)*.08+(Hs(x>>3,y>>2)>.8?-.25:0);K.px(x,y,1,1,Hd[v>.62?3:v>.42?2:v>.25?1:0]);}
  for(const [x,y,l] of [[30,14,9],[70,12,12],[108,16,8],[50,26,10],[92,26,7]]){K.px(x,y,l,1,Hd[1]);K.px(x+1,y+1,l-3,1,Hd[0]);}
  M4.outline(g.canvas,'#2a140c');});
// ---------------------------------------------------------------- skin her: open the hide down her belly, then work it off
S4.cwSkin=(sp,K)=>{const g=K.g,full=BS.full(),P=full?BG71.BL:BG71.BLT;BK.warm([()=>{for(const n of ['cowBodyB','cowSkinB','cowThighH','cowThighS'])BK.img(n);BS.hideSheet();}]);
  const PATH=[[150,132],[190,139],[234,140]];
  const o=S4.trace(Object.assign({},sp,{surface:'hide',tool:'knife',paths:[PATH.map(p=>p.slice())]}),K);const st=o.st;
  const D=BK.IMG.cowBodyB,HI=BK.img('cowBodyB'),W=HI.width,HH=HI.height,src=HI.getContext('2d').getImageData(0,0,W,HH).data;
  const top=new Int16Array(W).fill(-1),bot=new Int16Array(W).fill(-1);for(let x=0;x<W;x++)for(let y=0;y<HH;y++)if(src[(y*W+x)*4+3]){if(top[x]<0)top[x]=y;bot[x]=y;}
  const MC=document.createElement('canvas');MC.width=W;MC.height=HH;const mx=MC.getContext('2d');let lastP=-1;
  const G={t:0,ph:'cut',T:BS.tug(),i:0,p:0,pv:0,holes:[],score:1,endT:-1};const NP=5,XS=[176,206,236,196,222];
  const yb=(x,p)=>{if(top[x]<0)return -1;return Math.round(bot[x]+1-p*(bot[x]-top[x]+3));};
  const build=p=>{if(Math.abs(p-lastP)<.004)return;lastP=p;const id=mx.createImageData(W,HH),a=id.data;
    for(let x=0;x<W;x++){const b=yb(x,p);for(let y=0;y<HH;y++){const i=(y*W+x)*4;if(!src[i+3]||y>=b)continue;let r=src[i],gg=src[i+1],bb=src[i+2];
      if(y>=b-2&&p>0&&p<1){const c=y===b-1?[240,230,204]:[200,176,144];r=c[0];gg=c[1];bb=c[2];}a[i]=r;a[i+1]=gg;a[i+2]=bb;a[i+3]=255;}}
    mx.putImageData(id,0,0);for(const [hx,hy] of G.holes){if(hy-D[5]-BC.LY<yb(hx-D[4],p)-3){mx.fillStyle='#2a140c';mx.fillRect(hx-D[4]-2,hy-D[5]-BC.LY-1,5,3);mx.fillStyle='#7a1c22';mx.fillRect(hx-D[4]-1,hy-D[5]-BC.LY,3,1);}}};
  const up=o.update;o.update=function(dt,I){G.t+=dt;if(G.ph==='cut'){up.apply(this,arguments);if(st.done){st.done=false;G.cutScore=st.score;G.ph='work';G.cutAt=G.t;}return;}
    if(G.ph==='work'){const r=BS.tugUp(G.T,dt,I);if(r==='ok'){G.i++;BS.snd.tear(.8);K.judge(1,252,60,true);if(G.i>=NP){G.ph='off';G.endT=G.t;BS.snd.thump();}}
      else if(r==='tear'){const x=XS[G.i],X=x-D[4];G.holes.push([x,D[5]+BC.LY+yb(X,G.i/NP)-8]);lastP=-1;BS.snd.tear(1.2);K.judge(.2,252,60,true);MS.miss&&MS.miss();}
      else if(r==='back')MS.miss&&MS.miss();}
    const want=G.ph==='cut'?0:Math.min(1,G.i/NP+(G.ph==='work'&&G.T.down?BS.tense(G.T)*.05:0));G.pv+=(want-G.pv)*Math.min(1,dt*8);
    if(G.ph==='off'&&G.t-G.endT>1.1&&!st.done){st.done=true;st.score=Math.max(.5,(G.cutScore||1)-.1*G.holes.length);const af=BS.after();af.skinQ=Math.max(0,1-.25*G.holes.length);af.cowSkinned=1;}};
  const d0=o.draw;o.draw=function(t){BC.floor(K,g,full,P);BC.at(g,G.pv>.5?'cowThighS':'cowThighH');BC.at(g,'cowSkinB');
    BC.face(K,113,88,40,full,P,1);BC.face(K,151,150,6,full,P,1);BC.face(K,276,144,6,full,P,1);
    const p=G.ph==='off'?1:G.pv;if(p<.999){build(p);g.drawImage(MC,D[4],D[5]+BC.LY);}
    if(G.ph!=='cut'&&full)for(const [x,y,l] of [[168,128,9],[196,132,7],[222,133,10],[184,118,6]]){const n=Math.min(l,Math.round((G.t-(G.cutAt||0))*10));for(let i=0;i<n;i++)K.px(x+(i>l/2?1:0),y+i,i>l*.6?2:1,1,P[3]);if(n>=l){K.px(x,y+l,3,2,P[3]);K.px(x,y+l,1,1,P[5]);}}
    // the cut down her belly
    if(G.ph==='cut'){for(let s2=0;s2<Math.min(st.s,m4len(PATH));s2+=1){const [x,y]=m4at(PATH,s2);K.px(x,y,1,1,P[0]);K.px(x,y+1,1,1,full?BT3.MEAT[4]:P[2]);}
      for(let s2=st.s;s2<m4len(PATH);s2+=4){const [x,y]=m4at(PATH,s2);K.px(x,y,2,1,'#fff0d0');K.px(x+2,y,1,1,'#2a0e08');}
      if(!st.end){const ka=Math.PI-.62;M4.rot(g,M4S.knife(),st.tx,st.ty,ka,8,44);const [hx,hy2]=M4.tr(st.tx,st.ty,ka,-.5,-36.5);m4grip(K,hx,hy2,ka-Math.PI/2,{side:1});}
      if(!st.end&&st.s<2){const [sx,sy]=PATH[0];K.pa(sx-3,sy-3,7,7,'#ffd27a',.5+Math.sin(t*10)*.3);}}
    // working it off: your left fist grips the hide's edge and pulls; the knife in your right frees it from the fat
    if(G.ph==='work'){const x=XS[G.i],X=x-D[4],y=D[5]+BC.LY+yb(X,p)-2,ten=G.T.down?BS.tense(G.T):0;m4grip(K,x,y-2-ten*4,-1.2,{side:-1});
      const ka=Math.PI-.9,kx=x+14,ky=y+4+Math.sin(t*16)*(G.T.down?2:0);M4.rot(g,M4S.knife(),kx,ky,ka,8,44);const [hx,hy2]=M4.tr(kx,ky,ka,-.5,-36.5);m4grip(K,hx,hy2,ka-Math.PI/2,{side:1});}
    // and off: it slides down onto the boards in one piece
    if(G.ph==='off'){const a=Math.min(1,(G.t-G.endT)*1.6),hs=BS.hideSheet();g.drawImage(hs,Math.round(150+a*4),Math.round(118+a*a*30));}};
  o.title='Skin her';o.how='Open the hide down her belly with the knife ('+(K.fine?'hold the mouse button and draw along the dotted line':'drag along the dotted line')+'). Then work it off: hold to pull the hide back while the knife frees it, and let go when it gives. Hang on too long and you cut through the hide.';o.hint='Pull, feel it give, let go.';
  const au=o.auto;o.auto=function(dt,AP){if(G.ph==='work'){const a=BS.tugAuto(this,G.T,AP,dt);AP.hand=[XS[G.i],110];AP.press=a.down;return;}if(G.ph==='off'){const a=m4ai(this,AP,dt);m4hold(a,false);AP.press=false;return;}return au.apply(this,arguments);};
  const hd=o.hud;o.hud=function(){if(G.ph!=='cut'){K.label('HIDE '+Math.min(NP,G.i+1)+'/'+NP,30,20,'#f4ecd8','l');K.meter(G.i/NP,Math.max(.5,(G.cutScore||1)-.1*G.holes.length));return;}return hd&&hd.apply(this,arguments);};
  return o;};
// ---------------------------------------------------------------- on the gambrel: the carcass hung whole by both hocks, spine to
// spine. Each half is painted from the side of beef's own height field: the far half with the light turned before it's mirrored, so
// both are lit from the top left, the near half a step darker; each its own outline (a dent in one flank, one hock hung longer),
// three or four ribs each as lit ridges of red at uneven gaps, each steeper than the one above; the backbone dull bone broken by blood
BC.MX=161;BC.TOP=2;BC.SH=16;
BS.sideShade=(dark,ribs,xr,edge,tn)=>{const F=BT3.beefField(),f0=BT3.beefShade(),dist=F.dist,M=BT3.MEAT,B=BT3.BONE,BL=BG71.BL,E=edge||(y=>F.left[y]);
  return (x,y,id)=>{const sx=E(y)+1,d=dist[y*F.w+x];
    // the sawn spine down the inner edge: the vertebrae one under another, uneven, dull bone close in value to the meat, mostly under
    // blood, a broken dark seam between them (no pale strip with even bars: that read as a zip)
    if(tn&&id!==2&&y>40&&y<146&&x<sx+6&&d<8){const l=BT3.lightOf(F,x,y),k=(y*7+((y/9)|0)*5)%13;if(k<2)return BL[2];if(k<3)return BL[3];return bt3pick(B,.8+l*1.6-(x-sx)*.12);}
    if(!tn&&id!==2&&y>34&&y<150&&x>=sx-1&&x<sx+7){let sg=0,y0=34,ln=6;while(y0+ln<=y){y0+=ln;sg++;ln=5+((sg*2654435761)>>>0)%5;}const sy=y-y0,hh=((sg*2246822519)>>>0)%101,wv=5+hh%3;
      if(x<sx+wv){const l=BT3.lightOf(F,x,y),bl=((x*7+y*13+hh)%11)<(hh%2?7:4);
        if(sy===0&&(x+hh)%3)return BL[2];if(bl)return (x+y+hh)%5===0?BL[4]:BL[3];return bt3pick(B,.2+l*.9-(x-sx)*.12);}}
    // (Extreme) the inside of the rib cage: each rib a rounded ridge four wide, bowed, lit along its top, the meat between them in its shadow
    if(xr&&id!==2&&y>78&&y<144&&x>=sx+6&&x<F.right[y]-3){const l=BT3.lightOf(F,x,y);for(const [r0,sl] of ribs){const ux=x-(E(r0)+8);if(ux<0)continue;const W=F.right[r0]-F.left[r0]-12,dy=y-(r0+ux*sl+Math.sin(Math.min(1,ux/Math.max(1,W))*Math.PI)*3);
        if(dy>=0&&dy<4.6)return dy<1?bt3pick(M,4.9+l*.8):dy<2.6?bt3pick(M,3.9+l*.9):dy<3.6?bt3pick(M,3+l*.6):M[1];}return bt3pick(M,1.9+l*1.8);}
    if(id!==2&&y>80&&y<142&&x>=F.left[y]+7&&x<F.right[y]-3){const l=BT3.lightOf(F,x,y);for(const [r0,sl] of ribs){const ux=x-(F.left[r0]+8);if(ux<0)continue;const dy=y-(r0+ux*sl);
        if(dy>=0&&dy<2.2)return bt3pick(M,(dy<1?5.2:4.2)+l*.9);if(dy>=2.2&&dy<3.6)return M[1];}return bt3pick(M,2.5+l*2.3);}
    // no pale lump up by the spine at the top: two of them, one each side, met in the middle as a bow
    {const c=f0(x,y,id);if(!tn&&y>=26&&y<72&&x<sx+20&&typeof c==='string'&&c[0]==='#'){const v=parseInt(c.substr(1,2),16)+parseInt(c.substr(3,2),16)+parseInt(c.substr(5,2),16);if(v>480)return bt3pick(M,2.6+BT3.lightOf(F,x,y)*1.4);}return c;}};};
BS.side=mir=>{const xr=typeof BK!=='undefined'&&BK.X&&BK.X(),tn=!!window.GORE_TONED;return M4.pre((tn?'bs_side4_':xr?'bs_side9x_':'bs_side9_')+(mir?1:0),100,158,(K,g)=>{const lo=BT3.lightOf;
  BT3.lightOf=(F2,x,y)=>{const H=(X,Y)=>{if(X<0||Y<0||X>=F2.w||Y>=F2.h)return 0;if(tn)return F2.H[Y*F2.w+X];const d=((X-50)/22)**2+((Y-44)/22)**2;return F2.H[Y*F2.w+X]-(d<1?3.1*Math.sqrt(1-d):0);};const nx=(H(x-1,y)-H(x+1,y))*.5,ny=(H(x,y-1)-H(x,y+1))*.5,nz=.16;return (nx*(mir?.55:-.55)+ny*-.62+nz*.56)/Math.hypot(nx,ny,nz)-(mir?0:.14);};
  try{const M=BT3.beefMask(),M2={w:M.w,h:M.h,m:M.m.slice()},F=BT3.beefField(),XS=12,edge=y=>{const l=F.left[y];if(l<0||y<30||y>152)return l;return Math.round(y<48?l+(XS-l)*(y-30)/18:y>136?XS+(l-XS)*(y-136)/16:XS);};
    if(!tn)for(let y=30;y<=152;y++){const l=F.left[y],e=edge(y);if(l<0)continue;for(let x=Math.min(l,e);x<Math.max(l,e);x++)M2.m[y*M.w+x]=e<l?1:0;}
    if(!mir)for(let y=96;y<114;y++){const cut=Math.round(Math.sin((y-96)/18*Math.PI)*3);for(let k=0;k<cut;k++){const x=F.right[y]-k;if(x>0)M2.m[y*M.w+x]=0;}}
    const c=BT3.paint(M2,BS.sideShade(mir?0:.14,xr?(mir?[[80,.12],[88,.18],[96,.24],[104,.3],[112,.37],[120,.44],[128,.52]]:[[82,.14],[90,.2],[98,.26],[106,.32],[114,.39],[122,.46],[130,.54]]):(mir?[[84,.16],[96,.28],[108,.42],[121,.6]]:[[90,.2],[104,.36],[117,.55]]),xr,tn?null:edge,tn),BT3.MO);
    if(!tn){const cg=c.getContext('2d');cg.fillStyle='#3a0c10';for(let y=30;y<=152;y++){const e=edge(y);if(e>0)cg.fillRect(e-1,y,1,1);}}
    if(mir){g.save();g.translate(100,0);g.scale(-1,1);g.drawImage(c,0,2);g.restore();K.px(52,0,3,3,BT3.BONE[2]);K.px(52,0,1,3,BT3.BONE[4]);}else g.drawImage(c,0,0);}finally{BT3.lightOf=lo;}});};
BS.spine=()=>M4.pre('bs_spine3',60,158,(K,g,w,h)=>{const B=BT3.beef(),d=B.getContext('2d').getImageData(0,0,B.width,B.height).data,M=BT3.MEAT;
  for(let y=18;y<h-4;y++){let xl=-1;for(let x=0;x<B.width;x++)if(d[(y*B.width+x)*4+3]>128){xl=x;break;}const gap=xl-BC.SH;if(xl<0||gap<1||gap>5)continue;
    for(let x=30-gap-1;x<=30+gap;x++)K.px(x,y,1,1,Math.abs(x-29.5)<1?'#3a0c10':M[3]);}});
BC.carcass=(g,dy,split)=>{const y=BC.TOP+Math.round(dy||0),l=split?split.l:0,r=split?split.r:0;
  g.drawImage(BS.side(1),BC.MX+BC.SH-100+Math.round(l),y);g.drawImage(BS.side(0),BC.MX-BC.SH+Math.round(r),y);
  // (Toned keeps its carcass as it was: the halves joined by the filler down the middle)
  if(window.GORE_TONED){const S=BS.spine();g.drawImage(S,0,0,30,158,BC.MX-30+Math.round(l),y,30,158);g.drawImage(S,30,0,30,158,BC.MX+Math.round(r),y,30,158);}};
BC.gambrel=(K,dy)=>{const I=BG71.IRON,y=BC.TOP+Math.round(dy||0);BS.rail(K);K.px(BC.MX,13,1,Math.max(0,y-12),I[3]);K.px(100,y,123,3,I[2]);K.px(100,y,123,1,I[4]);K.px(100,y+2,123,1,I[0]);};
// the belly wall closing her, built from the carcass's own outline: muscle lit from the left, the line where the two sides meet,
// lumps of fat at the groin and on the brisket
BS.bellyWall=()=>M4.pre(window.GORE_TONED?'bs_belly4':'bs_belly5',320,180,(K,g,w,h)=>{const T=document.createElement('canvas');T.width=w;T.height=h;BC.carcass(T.getContext('2d'),0);const d=T.getContext('2d').getImageData(0,0,w,h).data,M=BT3.MEAT,F=BT3.FAT;
  const Hs=(x,y)=>{let v=(x*374761393+y*668265263)|0;v=(v^(v>>>13))*1274126177|0;return((v^(v>>>16))>>>0)/4294967295;};
  for(let y=BC.TOP+24;y<BC.TOP+150;y++){let l=-1,r=-1;for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>128){if(l<0)l=x;r=x;}if(l<0)continue;l+=10;r-=10;if(r-l<10)continue;
    for(let x=l;x<=r;x++){const u=(x-l)/(r-l)+Math.sin(y*.17+x*.03)*.035+Math.sin(y*.06)*.03,k=u<.2?5:u<.46?4:u<.8?3:2;let c=M[k];if(x===l||x===r)c=M[1];K.px(x,y,1,1,c);}
    K.px(BC.MX,y,2,1,M[1]);K.px(BC.MX-1,y,1,1,M[5]);}
  for(const [cx,cy,n] of [[BC.MX,BC.TOP+32,7],[BC.MX-3,BC.TOP+142,6]])for(let i=0;i<n;i++){const x=cx+Math.round((Hs(i,cy)-.5)*22),y=cy+Math.round((Hs(cy,i)-.5)*10),r=2+Math.round(Hs(i,i+cy)*2);K.ell(x,y,r+1,r,F[1]);K.ell(x-1,y-1,r,r-1,F[2]);K.px(x-1,y-1,1,1,F[4]);}});
BS.cliver=()=>BG71.spr('bscliv3',40,22,[{t:'dome',cx:12,cy:11,rx:11.5,ry:9.5,top:7,P:BG71.LIV,base:2.6,gain:3,glint:BG71.LIV[5],gl:.88},{t:'dome',cx:28,cy:12,rx:11,ry:8.6,top:6,z:.5,P:BG71.LIV,base:2.2,gain:3}],(K)=>{K.px(18,7,7,1,BG71.LIV[1]);},'#12040a');
BS.cheart=()=>BG71.spr('bschart3',22,26,[{t:'dome',cx:11,cy:15,rx:9.6,ry:10.6,top:8,P:['#1e0618','#3e0e2a','#5e1838','#80284a','#a2405c','#c6687a'],base:2.6,gain:3,glint:'#e08a96',gl:.9},{t:'tube',pts:[[9,6],[7,0]],r0:3.2,r1:2.6,z:2,P:BT3.FAT,base:2.4,gain:3}],(K)=>{K.px(4,5,14,3,BT3.FAT[2]);K.px(5,5,7,1,BT3.FAT[4]);for(let y=9;y<22;y++)K.px(11+Math.round((y-9)*.2),y,1,1,'#3e0e2a');},'#14040e');
BS.LUNG=['#7a4a54','#a8747a','#d0a0a0','#ecc4bc','#fae2da'];
BS.lungs=()=>BG71.spr('bslung3',44,30,[{t:'dome',cx:22,cy:16,rx:20,ry:12,top:7,P:BS.LUNG,base:2.8,gain:2.6},{t:'dome',cx:11,cy:18,rx:10,ry:9,top:5,z:1,P:BS.LUNG,base:3,gain:2.6},{t:'dome',cx:32,cy:18,rx:10,ry:9,top:5,z:.6,P:BS.LUNG,base:2.5,gain:2.6},
  {t:'tube',pts:[[22,2],[22,10]],r0:2.8,r1:2.4,z:3,P:['#8a7a7a','#b8a8a4','#dccac4','#f0e4de'],base:2.4,gain:3}],(K)=>{for(const [x,y,w] of [[8,15,3],[15,21,2],[26,13,3],[33,21,2],[20,24,3],[13,10,2],[30,9,2]]){K.px(x,y,w,1,BS.LUNG[1]);K.px(x,y-1,w-1,1,BS.LUNG[4]);}},'#3a1a22');
BS.boneSaw=()=>M4.pre('bs_bonesaw2',66,24,(K)=>{const I=BG71.IRON,W=CA_P.oak;
  for(let x=5;x<52;x++){K.px(x,14,1,1,I[5]);K.px(x,15,1,2,I[4]);K.px(x,17,1,1,I[2]);K.px(x,18,1,1,x%3===0?I[1]:I[3]);if(x%3===1)K.px(x,19,1,1,I[2]);}
  for(let x=3;x<54;x++){const y=Math.round(14-Math.sin((x-3)/51*Math.PI)*11);K.px(x,y,1,3,I[2]);K.px(x,y,1,1,I[5]);K.px(x,y+1,1,1,I[4]);}K.px(3,3,3,14,I[3]);K.px(3,3,1,14,I[5]);
  K.px(51,8,15,12,W[3]);K.px(51,8,15,2,W[5]);K.px(51,18,15,2,W[1]);K.px(53,11,11,3,W[4]);K.px(51,8,1,12,W[2]);},true);
// the paunch: green-grey and wet, its folds creased, veins running over it, a little fat along the grooves
BS.RUMEN=['#1e2418','#38402c','#566048','#788066','#9ca088','#c4c6ae'];
BS.paunch2=()=>BG71.spr('bspaunch3',58,42,[{t:'dome',cx:30,cy:20,rx:27,ry:19,top:14,P:BS.RUMEN,base:3,gain:3.2,glint:BS.RUMEN[5],gl:.88},{t:'dome',cx:13,cy:27,rx:11,ry:12,top:7,z:2,P:BS.RUMEN,base:2.7,gain:3},{t:'dome',cx:44,cy:30,rx:11,ry:9,top:6,z:1.5,P:BS.RUMEN,base:2.4,gain:3}],(K)=>{
  for(const [x0,y0,x1,y1] of [[20,6,34,30],[38,10,46,26]])for(let i=0;i<=20;i++){const u=i/20,x=Math.round(x0+(x1-x0)*u+Math.sin(u*Math.PI)*3),y=Math.round(y0+(y1-y0)*u);K.px(x,y,1,1,BS.RUMEN[1]);K.px(x-1,y,1,1,BS.RUMEN[4]);}
  for(const [x,y,l,dx,dy] of [[24,12,10,1,.4],[30,16,6,.3,1],[40,14,7,.8,.6],[10,22,6,.6,.8],[46,26,5,-.5,.9],[16,30,6,1,-.3]])for(let i=0;i<l;i++)K.px(Math.round(x+dx*i),Math.round(y+dy*i+Math.sin(i*.9)*.6),1,1,i%4===3?'#8a3a4a':'#5a2232');
  for(const [x,y,w] of [[22,31,6],[36,33,5]]){K.px(x,y,w,1,BT3.FAT[2]);K.px(x+1,y,w-2,1,BT3.FAT[4]);}},'#141810');
BS.tub=()=>M4.pre('bs_tub1',92,28,(K)=>{const Wd=CA_P.oak,I=CA_P.iron;for(let y=4;y<28;y++){const hw=Math.round(46-(y-4)*.25);for(let x=46-hw;x<46+hw;x++){const s=(x-(46-hw))/(hw*2);let k=s<.2?5:s<.5?4:s<.8?3:2;if((x-(46-hw))%9===0)k=1;K.px(x,y,1,1,Wd[k]);}}
  for(const y of [9,22]){const hw=Math.round(46-(y-4)*.25);K.px(46-hw,y,hw*2,2,I[3]);K.px(46-hw,y,hw*2,1,I[5]);}for(let x=1;x<91;x++){const dy=Math.round(Math.sqrt(Math.max(0,1-((x-46)/45)**2))*4);K.px(x,4-dy,1,1,Wd[6]);K.px(x,4+dy,1,1,Wd[2]);}
  for(let y=-3;y<=3;y++){const hw=Math.round(44*Math.sqrt(1-(y/4)**2));if(hw>0)K.px(46-hw,4+y,hw*2,1,y<1?Wd[0]:Wd[1]);}},true);
BC.TUB=[114,146];BC.TRAY=[194,142];
BC.floorTub=(K,g,full)=>{const [tx,ty]=BC.TUB;K.pa(tx-2,ty+26,96,4,'#000',.3);g.drawImage(BS.tub(),tx,ty);K.ell(tx+46,ty+4,42,3,'#1a0e08');};
BC.tray=(K)=>{const [x,y]=BC.TRAY;K.pa(x+2,y+6,92,3,'#000',.3);K.px(x,y,92,5,BG71.IRON[2]);K.px(x,y,92,1,BG71.IRON[4]);K.px(x,y+4,92,1,BG71.IRON[0]);K.px(x+2,y+5,2,4,BG71.IRON[1]);K.px(x+88,y+5,2,4,BG71.IRON[1]);};
S4.cwGut=(sp,K)=>{const g=K.g,full=BS.full(),P=full?BG71.BL:BG71.BLT;BK.warm([()=>{BS.side(0);BS.side(1);BS.bellyWall();BS.paunch2();BS.cliver();BS.cheart();BS.lungs();BS.tub();BG71.cowLoops(6);}]);
  const PATH=[[161,BC.TOP+28],[161,BC.TOP+90],[161,BC.TOP+148]];
  const o=S4.trace(Object.assign({},sp,{surface:'belly',tool:'knife',paths:[PATH.map(p=>p.slice())]}),K);const st=o.st;
  const G={t:0,ph:'hoist',T:BS.tug(),i:0,sep:0,roll:-1,tears:[],out:[],score:1,endT:-1};const [TX,TY]=BC.TRAY;
  const PL=[{at:[148,BC.TOP+96],to:[TX+22,TY-9],im:()=>BS.cliver(),o:[20,11]},{at:[162,BC.TOP+124],to:[TX+50,TY-11],im:()=>BS.cheart(),o:[11,13]},{at:[160,BC.TOP+112],to:[TX+76,TY-12],im:()=>BS.lungs(),o:[22,15]}];
  const jw=f=>{const kj=K.judge;K.judge=function(s2,x,y,q){return kj.call(this,s2,252,88,q);};try{f();}finally{K.judge=kj;}};
  const up=o.update;o.update=function(dt,I){G.t+=dt;if(G.ph==='hoist'){if(G.t>.9){G.ph='cut';}return;}
    if(G.ph==='cut'){jw(()=>up.apply(this,arguments));if(st.done){st.done=false;G.cutScore=st.score;G.ph='open';G.openT=G.t;BG71.snd.squish(1);}return;}
    if(G.ph==='open'){G.sep=Math.min(1,(G.t-G.openT)*1.6);if(G.sep>=1){G.ph='roll';G.roll=G.t;BG71.snd.slop();BS.after().rollAt=performance.now()/1000;K.shk=Math.max(K.shk,.1);}return;}
    if(G.ph==='roll'){if(G.t-G.roll>1.1){G.ph='pluck';BS.snd.thump();}return;}
    if(G.ph==='pluck'){const r=BS.tugUp(G.T,dt,I);if(r==='ok'){G.out.push({i:G.i,t0:G.t});BS.snd.tear(.7);K.judge(1,252,88,true);G.i++;if(G.i>=PL.length){G.ph='end';G.endT=G.t;}}
      else if(r==='tear'){G.tears.push({i:G.i});BS.snd.tear(1.2);K.judge(.2,252,88,true);MS.miss&&MS.miss();}else if(r==='back')MS.miss&&MS.miss();}
    if(G.ph==='end'&&G.t-G.endT>.8&&!st.done){st.done=true;st.score=Math.max(.5,(G.cutScore||1)-.12*G.tears.length);BS.after().cowGutted=1;}};
  const d0=o.draw;o.draw=function(t){const dy=G.ph==='hoist'?Math.round((1-Math.min(1,G.t/.9))**2*70):0;BC.gambrel(K,dy);BC.floorTub(K,g,full);BC.tray(K);BC.carcass(g,dy);
    const inside=G.ph!=='hoist'&&G.ph!=='cut';
    // what's in her, behind the wall: the paunch and the guts high up, the liver, the heart and the lungs low in the chest
    if(inside&&full){const rf=G.roll<0?0:Math.min(1.2,(G.t-G.roll)/1.0),fy=v=>Math.round(rf*rf*v);
      if(G.ph==='open'||rf<1.15){g.drawImage(BS.paunch2(),132,BC.TOP+34+fy(110));g.drawImage(BG71.cowLoops(6),118,BC.TOP+68+fy(76));g.drawImage(BG71.cowLoops(5),156,BC.TOP+64+fy(80));}
      for(let k=0;k<2;k++){if(G.out.some(e=>e.i===k)||k===G.i&&G.ph==='pluck'&&G.T.down)continue;const p=PL[k];g.drawImage(p.im(),p.at[0]-p.o[0],p.at[1]-p.o[1]);}}
    // the belly wall, parting along its middle as it's opened, gone once it's open
    if(!inside||G.sep<1){const W=BS.bellyWall(),s=Math.round((inside?G.sep:0)*22),M=BC.MX;g.drawImage(W,0,0,M,180,-s,dy,M,180);g.drawImage(W,M,0,320-M,180,M+s,dy,320-M,180);}
    // blood out of her low end, into the tub; and the heap in it
    if(inside){const n=Math.min(BC.TUB[1]+4-(BC.TOP+150),Math.round((G.t-G.openT)*26));for(let i=0;i<n;i++){const w=1+Math.floor(i/Math.max(1,n)*3);K.px(160,BC.TOP+150+i,w,1,P[3]);if(full&&w>1)K.px(160,BC.TOP+150+i,1,1,P[4]);}
      if(full){K.px(150,BC.TOP+146,22,3,P[2]);K.px(154,BC.TOP+146,8,1,P[4]);BS.drip(K,166,BC.TOP+150,BC.TUB[1]+3,G.t,.45,P);}}
    if(G.roll>=0&&G.t-G.roll>.8){const [tx,ty]=BC.TUB;if(full){K.ell(tx+44,ty+4,30,3,BS.RUMEN[2]);K.ell(tx+38,ty+3,18,2,BS.RUMEN[4]);K.ell(tx+62,ty+5,10,2,BG71.GUT[3]);K.px(tx+20,ty+5,12,1,P[3]);}else{K.ell(tx+46,ty+4,34,3,'#4a3a26');K.ell(tx+44,ty+3,26,2,'#6a5636');}}
    // the pieces cut free and laid on the tray, each its own colour; the one coming out on its strands, your fist on it
    for(const e of G.out){const p=PL[e.i],a=Math.min(1,(G.t-e.t0)*2.6),x=p.at[0]+(p.to[0]-p.at[0])*a,y=p.at[1]+(p.to[1]-p.at[1])*a-Math.sin(a*Math.PI)*18;
      if(full){g.drawImage(p.im(),Math.round(x-p.o[0]),Math.round(y-p.o[1]));if(a>=1)K.px(Math.round(x)-6,TY,12,1,P[3]);}else K.px(Math.round(x)-7,Math.round(y)-5,14,9,P[1]);}
    if(full)for(const e of G.tears){const [x,y]=PL[e.i].at;K.px(x-6,y+6,12,2,'#4a6a1e');K.px(x-4,y+8,4,9,'#3a5a16');K.px(x-4,y+6,6,1,'#7a9a3a');}
    if(G.ph==='pluck'){const p=PL[G.i],ten=G.T.down?BS.tense(G.T):0,[ax,ay]=p.at,x=ax+ten*10,y=ay+4+ten*10;if(G.T.down){if(full){BS.strands(K,ax,ay-2,x,y,ten,P);g.drawImage(p.im(),Math.round(x-p.o[0]),Math.round(y-p.o[1]));}else K.px(Math.round(x)-7,Math.round(y)-5,14,9,P[1]);}
      m4grip(K,x+4,y+6,.6,{side:1});}
    if(G.ph==='cut'){for(let s2=0;s2<Math.min(st.s,m4len(PATH));s2+=1){const [x,y]=m4at(PATH,s2);K.px(x,y,1,1,P[0]);K.px(x+1,y,1,1,full?BT3.MEAT[5]:P[2]);}
      for(let s2=st.s;s2<m4len(PATH);s2+=4){const [x,y]=m4at(PATH,s2);K.px(x,y,2,1,'#fff0d0');K.px(x+2,y,1,1,'#2a0e08');}
      if(!st.end){const ka=Math.PI-.62;M4.rot(g,M4S.knife(),st.tx,st.ty,ka,8,44);const [hx,hy2]=M4.tr(st.tx,st.ty,ka,-.5,-36.5);m4grip(K,hx,hy2,ka-Math.PI/2,{side:1});}
      m4grip(K,126,60,1.2,{side:-1});if(!st.end&&st.s<2){const [sx,sy]=PATH[0];K.pa(sx-3,sy-3,7,7,'#ffd27a',.5+Math.sin(t*10)*.3);}}};
  o.title='Gut her';o.how='She goes up on the gambrel by her hocks. Open her belly down the middle with the knife ('+(K.fine?'hold the mouse button and draw down the dotted line':'drag down the dotted line')+'), not too deep, and the paunch and the guts roll out into the tub. Then cut free the liver, the heart and the lungs: hold to pull, let go when it gives.';o.hint='Pull, feel it give, let go.';
  const au=o.auto;o.auto=function(dt,AP){if(G.ph==='pluck'){const a=BS.tugAuto(this,G.T,AP,dt);AP.hand=PL[G.i].at.slice();AP.press=a.down;return;}if(G.ph!=='cut'){const a=m4ai(this,AP,dt);m4hold(a,false);AP.hand=[-40,-40];AP.press=false;return;}return au.apply(this,arguments);};
  const hd=o.hud;o.hud=function(){if(G.ph==='pluck'||G.ph==='end'){K.label('CUT FREE '+Math.min(PL.length,G.i+1)+'/'+PL.length,30,20,'#f4ecd8','l');K.meter(G.i/PL.length,Math.max(.5,(G.cutScore||1)-.12*G.tears.length));return;}if(G.ph==='cut')return hd&&hd.apply(this,arguments);K.meter(0,1);};
  return o;};
// ---------------------------------------------------------------- split her down the spine with the saw into two sides
S4.cwSplit=(sp,K)=>{const g=K.g,full=BS.full(),P=full?BG71.BL:BG71.BLT;BK.warm([()=>{BS.side(0);BS.side(1);BS.boneSaw();}]);
  const PATH=[[161,BC.TOP+14],[161,BC.TOP+84],[161,BC.TOP+152]];
  const o=S4.trace(Object.assign({},sp,{surface:'spine',tool:'knife',paths:[PATH.map(p=>p.slice())]}),K);const st=o.st;
  const G={t:0,ph:'saw',endT:-1,sT:0};
  const up=o.update;o.update=function(dt,I){G.t+=dt;if(G.ph==='saw'){const s0=st.s,kj=K.judge;K.judge=function(s2,x,y,q){return kj.call(this,s2,252,88,q);};try{up.apply(this,arguments);}finally{K.judge=kj;}
      if(st.s>s0+.05){G.sT-=dt;if(G.sT<=0){G.sT=.13;BS.snd.saw();if(Math.random()<.2)BG71.snd.crack();}}
      if(st.done){st.done=false;G.score=st.score;G.ph='part';G.endT=G.t;BG71.snd.crack();BS.snd.thump();}return;}
    if(G.ph==='part'&&G.t-G.endT>1.6&&!st.done){st.done=true;st.score=G.score;BS.after().cowSplit=1;}};
  const d0=o.draw;o.draw=function(t){const a=G.ph==='part'?Math.min(1,(G.t-G.endT)/.7):0,b=G.ph==='part'?Math.min(1,Math.max(0,(G.t-G.endT-.7)/.8)):0;
    BC.gambrel(K,0);BC.floorTub(K,g,full);const [tx,ty]=BC.TUB;if(full){K.ell(tx+44,ty+4,30,3,BS.RUMEN[2]);K.ell(tx+38,ty+3,18,2,BS.RUMEN[4]);}
    if(G.ph==='saw'){BC.carcass(g,0);const n=Math.min(st.s,m4len(PATH));for(let s2=0;s2<n;s2+=1){const [x,y]=m4at(PATH,s2);K.px(x,y,1,1,P[0]);K.px(x-1,y,1,1,full?BT3.MEAT[2]:P[1]);if((s2|0)%9===4)K.px(x+1,y,1,1,P[3]);}
      if(!st.end&&st.s>1){const [x,y]=[st.tx,st.ty];K.px(x+1,y,3,2,'#e8dcc8');K.px(x+2,y+2,1,1,'#c8b8a4');for(let i=3;i<14;i+=1)if((i+Math.floor(t*20))%3)K.px(x+2,y+i,1,1,'#d8ccb8');}
      for(let s2=st.s;s2<m4len(PATH);s2+=4){const [x,y]=m4at(PATH,s2);K.px(x,y,2,1,'#fff0d0');K.px(x+2,y,1,1,'#2a0e08');}
      // the saw in your fist, its teeth on the cut, back and forth
      if(!st.end){const ang=-.5,bob=Math.sin(t*20)*3,cx=st.tx+Math.cos(ang)*bob,cy=st.ty+Math.sin(ang)*bob;M4.rot(g,BS.boneSaw(),cx,cy,ang,8,17);const [hx,hy]=M4.tr(cx,cy,ang,50,-3);m4grip(K,hx,hy,ang,{side:1});}
      m4grip(K,126,60,1.2,{side:-1});if(!st.end&&st.s<2){const [sx,sy]=PATH[0];K.pa(sx-3,sy-3,7,7,'#ffd27a',.5+Math.sin(t*10)*.3);}}
    else{// two sides: the far one taken off along the rail; yours runs along it to the end of the block
      g.drawImage(BS.side(1),Math.round(BC.MX+BC.SH-100-a*a*220),BC.TOP);const x0=BC.MX-BC.SH;g.drawImage(BS.side(0),Math.round(x0+(16-x0)*b*b),Math.round(BC.TOP+(4-BC.TOP)*b));}};
  o.title='Split her';o.how='Saw her down the middle of the backbone, top to bottom: '+(K.fine?'hold the mouse button and draw down the dotted line':'drag down the dotted line')+'. Stay on the line and keep it steady.';o.hint='Saw down the line, steady.';
  const au=o.auto;o.auto=function(dt,AP){if(G.ph!=='saw'){const a=m4ai(this,AP,dt);m4hold(a,false);AP.press=false;return;}return au.apply(this,arguments);};
  return o;};
// ---------------------------------------------------------------- wash the side down: the blood sheets off into the drain
BS.scrub=()=>M4.pre('bs_scrub2',20,11,(K)=>{const W=CA_P.oak;K.px(0,0,20,6,W[3]);K.px(0,0,20,1,W[5]);K.px(0,5,20,1,W[1]);K.px(2,2,16,2,W[4]);K.px(1,6,18,4,'#3a2a1a');K.px(1,6,18,1,'#7a6040');K.px(2,9,16,1,'#241a10');},true);
BS.stains=()=>M4.pre('bs_stain1',100,156,(K,g,w,h)=>{const B=BT3.beef(),sd=B.getContext('2d').getImageData(0,0,w,h).data,P=BG71.BL;
  const Hs=(x,y)=>{let v=(x*374761393+y*668265263)|0;v=(v^(v>>>13))*1274126177|0;return((v^(v>>>16))>>>0)/4294967295;};
  const blob=[[30,40,10],[60,70,12],[24,104,9],[52,128,11],[70,30,7],[40,150,8]];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(sd[(y*w+x)*4+3]<128)continue;let v=0;for(const [cx,cy,r] of blob){const d=Math.hypot(x-cx,(y-cy)*.7)/r;v=Math.max(v,1-d);}v+=Hs(x>>2,y>>2)*.25-.12;
    if(v>.5)K.px(x,y,1,1,v>.75?P[2]:P[3]);else if(v>.38&&(y%3)===0)K.px(x,y,1,1,P[3]);}});
S4.cwWash=(sp,K)=>{const g=K.g,full=BS.full(),P=full?BG71.BL:BG71.BLT;BK.warm([()=>{BT3.beef();BS.scrub();BS.stains();BK.bucket();}]);
  const st={t:0,p:0,sc:0,sT:0,endT:-1,score:1};
  return {title:'Wash her down',how:'Hold to scrub the side down with the brush and water. The blood sheets off and runs to the drain; keep at it until it runs clear.',hint:'Hold to scrub until the water runs clear.',st,
    update(dt,I){st.t+=dt;const d=!!I.down&&st.endT<0;if(d){st.p=Math.min(1,st.p+dt/3.2);st.sc+=dt;st.sT-=dt;if(st.sT<=0){st.sT=.2;BS.snd.scrub();}}if(I.pressed&&st.endT<0)st.p=Math.min(1,st.p+.03);st.dn=d;
      if(st.p>=1&&st.endT<0){st.endT=st.t;K.judge(1,250,96,true);}if(st.endT>=0&&st.t-st.endT>.8)st.done=true;},
    draw(t){const B=BT3.beef(),k=full?Math.max(0,1-st.p*1.1):Math.max(0,.6-st.p);
      // the drain in the boards, the bucket of water
      K.px(52,168,26,8,'#141210');for(let x=54;x<76;x+=3)K.px(x,169,1,6,BG71.IRON[3]);K.px(52,168,26,1,BG71.IRON[4]);g.drawImage(BK.bucket(),150,146);K.ell(167,149,13,2,BS.WAT[2]);K.px(160,148,5,1,BS.WAT[4]);
      BS.hook(K,63,15,4);g.drawImage(BS.side(0),16,4);g.globalAlpha=Math.max(0,1-st.p)*(full?.9:.6);g.drawImage(BS.stains(),16,4);g.globalAlpha=1;
      // the brush in your fist going up and down her; the water sheeting off, carrying the blood to the drain
      const bx=Math.round(66+Math.sin(st.sc*6)*20),by=Math.round(30+((st.sc*40)%110));
      if(st.dn){g.globalAlpha=.35;K.ell(bx,by+6,14,9,BS.WAT[4]);g.globalAlpha=1;}
      if(st.p>0)for(const [x0,len,sp] of [[bx-5,Math.min(150-by,40),40],[bx+7,Math.min(140-by,22),30]]){const n=Math.min(len,Math.round(st.sc*sp));const C=[BS.tint(BS.WAT[1],k),BS.tint(BS.WAT[3],k),BS.tint(BS.WAT[4],k)];
        for(let i=0;i<n;i++){const w2=1+Math.floor(i/Math.max(1,len)*2.5);K.px(x0,by+8+i,w2,1,C[1]);if(w2>1)K.px(x0,by+8+i,1,1,C[2]);K.px(x0+w2,by+8+i,1,1,C[0]);}if(n>=len)K.px(x0,by+9+n,3,2,C[1]);}
      if(st.p>0){const n=Math.round(Math.min(1,st.p*4)*10);for(let i=0;i<n;i++){const x=Math.round(64-i*.6),y=166+i%2;K.px(x,y,3,1,BS.tint(BS.WAT[3],k));}}
      g.drawImage(BS.scrub(),bx-10,by);m4grip(K,bx,by-2,0,{side:1});m4grip(K,30,40,1.2,{side:-1});},
    hud(){K.label('WASH',30,20,'#f4ecd8','l');K.meter(st.p,1);},
    auto(dt,AP){const a=m4ai(this,AP,dt);m4hold(a,st.endT<0);AP.hand=[66,80];AP.press=a.down;}};};

// ================================================================ the order, the takings
// each run starts clean
BS.reset=()=>{const af=BS.after();for(const k of ['henGutted','henSpoil','feathers','cowHeadOff','cowSkinned','cowGutted','cowSplit','skinQ','cowPool','rollAt','henOut','stunBad','gibOut'])delete af[k];};
for(const k of ['bgPin','bgStun']){const f=S4[k];if(f)S4[k]=(sp,K)=>{BS.reset();return f(sp,K);};}
if(typeof MG4R!=='undefined'){const H=MG4R['b_butcher:hen'],C=MG4R['b_butcher:cow'];
  const ins=(R,list)=>{if(!R||R.steps.some(s=>s.k===list[0].k))return;const i=R.steps.findIndex(s=>s.k==='trace');R.steps.splice(i<0?R.steps.length:i,0,...list);};
  ins(H,[{k:'hnScald',t:'Scald her'},{k:'hnPluck',t:'Pluck her'},{k:'hnGut',t:'Feet off, and draw her'},{k:'hnRinse',t:'Rinse her'}]);
  ins(C,[{k:'cwHead',t:'Head and shanks'},{k:'cwSkin',t:'Skin her'},{k:'cwGut',t:'Gut her'},{k:'cwSplit',t:'Split her'},{k:'cwWash',t:'Wash her down'}]);
  const tr=C&&C.steps.find(s=>s.k==='trace');if(tr)tr.t='Break the side down along its seams';}
// what you take from her: feathers and giblets from the hen; from the cow, her hide raw off her and her heart and liver
Object.assign(ITEMS,{
  feathers:{name:'Feathers',icon:'feathers',sell:9,desc:'A twist of her feathers, dried by the stove. A pillow, fletching, a quilt one winter.'},
  giblets:{name:'Giblets',icon:'giblets',sell:14,desc:'Her heart, her liver and her gizzard, kept back. Gravy, if you can face it.'},
  rawhide:{name:'Raw hide',icon:'rawhide',sell:48,desc:'Off your own cow in one piece, the fat side in. Salted and scraped it would keep; one day it could be tanned into leather. The armour bench will take it for a coat.'},
  offal:{name:'Offal',icon:'offal',sell:22,desc:'Her heart and her liver, wrapped in paper. Ezra says it’s the best of her. Nobody else in the valley will eat it.'}});
{const V=vendors.b_butcher,_rows=V.rows;V.rows=()=>_rows().map(r=>{if((r.k!=='hen'&&r.k!=='cow')||(typeof BG71!=='undefined'&&BG71.ezra()))return r;const b=r.buy;
  return Object.assign({},r,{buy(){b.apply(this,arguments);if(r.k==='hen'){addInv('feathers',1);addInv('giblets',1);}else{if(inv('hide')>0)takeInv('hide',1);addInv('rawhide',1);addInv('offal',1);}}});});}
// the hide coat takes a raw hide when there's no cured one
{const _ra=vendors.b_armor.rows;vendors.b_armor.rows=()=>_ra().map(r=>r.k==='hidecoat'&&r.need&&r.need.hide&&inv('hide')<1&&inv('rawhide')>0?Object.assign({},r,{need:(n=>{delete n.hide;n.rawhide=1;return n;})(Object.assign({},r.need))}):r);}
// a ragged skinning: the hide is worth less than the rest of her
{const _fc=finishCraft;finishCraft=function(v,r,q){const before=inv('rawhide');const out=_fc.apply(this,arguments);try{
  if(v==='b_butcher'&&r&&r.k==='cow'&&inv('rawhide')>before&&typeof qStars==='function'&&S.iq&&S.iq.rawhide){const sq=BS.after().skinQ;if(sq!=null&&sq<.8){const s0=qStars(q),lo=Math.max(0,qStars(q*sq));const G=S.iq.rawhide;
    if(lo<s0&&G[s0]>0){G[s0]--;G[lo]++;setTimeout(()=>toast('The hide is cut through in places. It won’t fetch what a clean one would.',3),3400);}}}}catch(e){}return out;};}
// their icons, drawn in t373/icons374.py
/*@@ICONS*/
BS.ICONS={"feathers": "data:image\/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACeElEQVR4nO1XLWwUQRT+jiAQS3JiQbQCxIpmMJtNcwKBPEVQF0T1BY0gyIqTKDSpwTbNNdlcTdUWgZhsJms6qTiSg6SE0DO0K3CLaGY6Mzsz+9OA4jM7+2bfe9\/79s3eO6ADSBhULpAwqGzP2+wq7vqSAQBflwNz7\/zruVwXbOn0Pb24AgA8eXDfGatmsDjLveP8rJasYEtQygAAB3u7UH0F0c1HmzKWSUJTgIRBZTrbiKjJXRD+BVtqJE3c8TkDwNHhCY4OTwAA4+0tWY0LpxdXWnIVk+kMZk9IAiQMquP8TEsuQCnDZDrzJhby20ApQ55T5Dmt7VkVEPBJ3AThq0q\/Kha1HpAE+LocjLe3rMFGo8Rq55y3ImOrvEbgb8NWfY2AqUKcRNrDk+lM6xFCiLYvGlDI30ahRgVEkNEoqb0KXwLOOcryN\/KcOqu3EjBVIIRoiVx90heNCsRJpJF492Hhfb5gS636XgR8J0KF2gPqN0S1++R3EjBhNqMkqvSHaW9TvZdAUy+4bEJ+oLl6LwEbzISmMn2+nF4CQgU1MCGkdm9Dm+obCVhJWSRX10L+tmj+EK3LwdtXzxsDFWwpkx\/s7baqHvCMZBYScljhnFtPRhDc66xAK5bAzbQkhhPOuXz\/lDKZvEv1QMce+PXlI6JhhmiYAQCiYQbOOXbGlwCAnfEl4mSjNvXcmgAJg2q+\/wY\/vq2k7cXTn3Kdfn6o3Xch0aoHVKRpdr0IXwLrfXlN066RrtGpB+JkQ7PFz16j+PReXgUK9r11H7QmIEiI9eNYP5qr4uZXsksT9gYJg2oxz6rFPGv8++VD75lQrfI2Ff+zofQ\/XPgDhhGQ4KrWWpgAAAAASUVORK5CYII=", "giblets": "data:image\/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACSUlEQVR4nO2Wv2vbQBTHvw4dQrhAhyN0CCWYEIwImTIH06FDh9CphAwZPIQOnkro0D8hhNIhZM5UTEcPpmQowWTqVjDGiCCCMakxohTrEB0MymCecjrdnU5QKAV\/J90P3ef7np6eBCy00D9W5W8f6HGW6Ob7odCyCg2UOdDjLOkcN\/C0eZTOhaMBAGD\/1VvtPU+KwJ\/PzrXrhyfNxGSEoC7SZsDjLCHw4Pqb9sZa\/QUZQT8UFYq+9\/1HZt9wHAEAgqlAJ77PGc5lgOAmMKl9+QUAcLC9h1avq31MBLdpqXCHRv5dmF7fjifGfV\/vfwKYR+9kwCV6GU7a5bXMeDiOctH7Qp8NYxGSpvU32YnLC+t+FWyLvtDARvNDbm7n7CMA4OrkXZr+4Pcc0mnfaM8xRQ8ob4HHWXKwvWfzlEqF\/5qN5iaOG+i0bxBMBXwRYYutwhcRbpci7SubqYF+KCqtXrcQrBYewWVR1LboAcMjIMDms7XMWBZFDgCnLx+ztv+plV7PVuL0ulQr9jhL1MrWgQHg9TrT7gOA2tY8gPdX3fLfAmrFqhEysLMMVLkZDgBB+Gj2Woy0Jpw+RlXwdPycLWfWq5ylkZIG\/iQDB4Ch+IMAYXErVuGNjfyjUA8f+BPjGsFNMrZij7NELi4TgMZBKKzwYRzn1gCHTmgCF63JUZvgzgZMcILIdaGmm+CzlbhcEXqcJXW2bgXbJEdtglsNqCZMUFt6qRGZ4IUGyIT8GurAcseTZQM7G5BN6KK1pddFzjeW\/d1e6L\/RA8FlQyaufad4AAAAAElFTkSuQmCC", "rawhide": "data:image\/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACZElEQVR4nOVXPUgjQRT+IpYpLIJYiYWFhmPLKyzkihRioWJ1lVpaHHIcYuMRJGAjIoeVpaayinrFYZHKwsJyi80iKUQsjpAihf1aLG\/ydvbNzE6KE7kPQjYz7+fbN2\/eewH+d5RGUapWyolpL+q\/etn0JlCtlJO7m7pxf3G14UVi3OTEZeTp4T7zu9vpOZ1JdsckoeZ+DdVKOaGPzWi307M653bq60Hu+Eq68N1NHU8P95j5vKDWF1cb6rm5XxNJcDRaoXrmx9W+uFb7FAnxCIA0xGSYGykSepu8DhUBCr1udHZ+0mpAImDS4bIUhZLuXBeenZ\/MPNsccwL6S7SuHgEAwdxEhsQ4kN7djcN2AqRnbDLe7fScETHpEcJ4gOvoGeQ3d9UoS+vrgWLPjYTxQHTC34w7C+YmlA53TDK5JKTNRitMgDSh9ETizkyE+L7k2EiAEzHVAJdTkz1pPVeI\/jWMEZBAZ6qv8W8pF0YiwKsikCZjGA+8wp8hEz2L\/eVjHAFdQVf2m66iDe8eAfFq6KWZyigwfMuiEeDgXVAkQPde7wsSARuWDk5x9HVDJEetmohkuiG1UV75ikw6EgEdtwc7AIDa5hqA4ehm7IYcviTCeIC9y6ZTbiH4ku2GptD7FBeeG\/2XGH\/P2+r3p5\/f0H+JAQAry9uI+q8l8RryM\/eB7hwAprZquTWOXBKuVaczAtTJCNSmbQR0nd9\/ztCNhs5\/7P6yz4TcAL82rgmZ936ut7K8rfROjr9ndMSBxPafgMZrCdT7XfqFBpKi8J0NrIWoKKRcAeB8ewkjESAS+pqvcwB4A6k6fTOB85kSAAAAAElFTkSuQmCC", "offal": "data:image\/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACfElEQVR4nO2WwWsTQRTGvyyCEiYVZClaSig5LBJ6KAqeSumxeNCecvLgSUrxIOIpf0AQ6aEnCRGkBE85eSyllFBKCCGUCCGGRUJZgojsoSTD2FPjIew4Mzs7m9IUL\/kgZGff7vt9b97uzAIzzfSflZhmsqxNRuK449OEGlfPTc3A+c+mBPf7XQDAs6db\/Nybl6vY3TuRjN2aBjxrk1EAVFWrl\/lxpVgKxa9lIJjyDyuP0c1\/kmLeryEAoDeg2Cq\/isxxpRaoPa7Vyzj\/XEW78U26rnTqYmPhATcAAE4uw+NiG4wzoAOKqhRLWGj9iTXu0iFYx0Nucw2ueybFJANxQL\/fi4WJCqo3iRvI2mSkA\/bdH5E3O84SaOu7dC7o\/aQKtUCtsllqGhMkLy6Rvp8KgYPqXWo2JBloHR3w46BXc+s2BlXfmOSqVYsKrVS1ehmto4PYygP1fIplkvw3HlC4dAiHpHj1b98\/D923nf+Cjk8T2rdAhT905qVx1\/3N4QDQpgzLJCk9dCa4+CZY0bXJQPHX8ymHB2pTBmaN0zkkBQC4tG5jJ79vzD2RgUA6MABkbIKMTQAAzLLALAuLc3eRJncAADv5fVS+HmtzhlpQKZa0kEnMqfLoxfifMaSRDMUBZQY6Pk3s7p2gcFiYGlwnx1nCx8ILZG0yilyKc\/n12P55jGF1\/p4R7DGmvTd4EI17wbvCBjcRlSiqUvH619uPJKio2O04\/WTcu6geeg0WaU6EA+NdUFTkOiAqt7lmjFdwHGmu2vAkqPo5BkTMgLgkm+S6Z1jJpvlYV2FcDu0F4pKs69t1gKqMLVDh0wBObMDv924EOLHUr6OZbkp\/AXwoQsBNakOwAAAAAElFTkSuQmCC"};
/*@@ENDI*/
for(const [k,u] of Object.entries(BS.ICONS||{})){try{const im=new Image();im.src=u;if(typeof IMG!=='undefined')IMG[u]=im;SPR['icon32_'+k]={src:u,fw:32,fh:32,ax:16,ay:32,foot:[0,0,0,0],lazy:1};if(typeof ICON!=='undefined')ICON[k]=u;}catch(e){}}
