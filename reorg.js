const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'src');

const dirsToCreate = [
    'components/core',
    'features/player/components',
    'features/player/hooks',
    'features/world/components',
    'features/hud/components',
    'config'
];

dirsToCreate.forEach(d => {
    fs.mkdirSync(path.join(src, d), { recursive: true });
});

const moves = [
    { from: 'components/ui/button.tsx', to: 'components/core/button.tsx' },
    { from: 'components/ui/sonner.tsx', to: 'components/core/sonner.tsx' },
    { from: 'components/game/PlayerAvatar.jsx', to: 'features/player/components/PlayerAvatar.jsx' },
    { from: 'hooks/usePlayer.js', to: 'features/player/hooks/usePlayer.js' },
    { from: 'components/game/GameHUD.jsx', to: 'features/hud/components/GameHUD.jsx' },
    { from: 'components/game/WorldMap.jsx', to: 'features/world/components/WorldMap.jsx' },
    { from: 'components/game/MapLocation.jsx', to: 'features/world/components/MapLocation.jsx' },
    { from: 'components/game/locationArt.jsx', to: 'features/world/components/locationArt.jsx' },
    { from: 'components/game/LocationTooltip.jsx', to: 'features/world/components/LocationTooltip.jsx' },
    { from: 'components/game/WorldSceneLayout.jsx', to: 'features/world/components/WorldSceneLayout.jsx' },
    { from: 'game/locations.js', to: 'config/locations.js' },
];

moves.forEach(m => {
    const fromPath = path.join(src, m.from);
    const toPath = path.join(src, m.to);
    if (fs.existsSync(fromPath)) {
        fs.renameSync(fromPath, toPath);
    }
});

// Remove empty directories if they exist
try { fs.rmdirSync(path.join(src, 'components/ui')); } catch(e){}
try { fs.rmdirSync(path.join(src, 'components/game')); } catch(e){}
try { fs.rmdirSync(path.join(src, 'game')); } catch(e){}
try { fs.rmdirSync(path.join(src, 'hooks')); } catch(e){}

// Replacements
const replacements = [
    { old: '@\/components\/ui\/button', new: '@/components/core/button' },
    { old: '@\/components\/ui\/sonner', new: '@/components/core/sonner' },
    { old: '@\/components\/game\/PlayerAvatar', new: '@/features/player/components/PlayerAvatar' },
    { old: '@\/hooks\/usePlayer', new: '@/features/player/hooks/usePlayer' },
    { old: '@\/components\/game\/GameHUD', new: '@/features/hud/components/GameHUD' },
    { old: '@\/components\/game\/WorldMap', new: '@/features/world/components/WorldMap' },
    { old: '@\/components\/game\/MapLocation', new: '@/features/world/components/MapLocation' },
    { old: '@\/components\/game\/locationArt', new: '@/features/world/components/locationArt' },
    { old: '@\/components\/game\/LocationTooltip', new: '@/features/world/components/LocationTooltip' },
    { old: '@\/components\/game\/WorldSceneLayout', new: '@/features/world/components/WorldSceneLayout' },
    { old: '@\/game\/locations', new: '@/config/locations' },
];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const files = walk(src);

files.forEach(file => {
    if (!file.match(/\.(jsx?|tsx?)$/)) return;
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    replacements.forEach(r => {
        const regex = new RegExp(r.old, 'g');
        if (regex.test(content)) {
            content = content.replace(regex, r.new);
            changed = true;
        }
    });
    
    if (changed) {
        fs.writeFileSync(file, content);
        console.log('Updated imports in', file);
    }
});

console.log('Reorganization complete.');
