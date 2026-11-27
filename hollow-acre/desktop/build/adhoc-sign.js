// electron-builder's afterPack hook: gives the Mac app an ad-hoc signature (codesign with "-", no Apple certificate).
// A Mac on Apple silicon refuses any app whose signature doesn't match its files, and packing the app changes Electron's files,
// so without this the downloaded app would say it "is damaged". With it, macOS only asks the player to confirm the first open
// (README.md: right-click > Open, or System Settings > Privacy & Security > Open Anyway). An Intel Mac gets the same signature.
// The app isn't signed for anything else: no hardened runtime, so it needs no entitlements, and electron-builder's own signing
// is off ("identity": null in package.json), so it leaves this signature as it is.
const {execFileSync}=require('child_process');const path=require('path');
exports.default=async function(ctx){
  if(ctx.electronPlatformName!=='darwin')return;
  const app=path.join(ctx.appOutDir,ctx.packager.appInfo.productFilename+'.app');
  if(process.platform!=='darwin'){console.log('  • not on a Mac, so the app is left without a signature:',app);return;}
  execFileSync('codesign',['--force','--deep','--sign','-',app],{stdio:'inherit'});
  execFileSync('codesign',['--verify','--deep','--strict','--verbose=2',app],{stdio:'inherit'});
  console.log('  • ad-hoc signed',app);};
