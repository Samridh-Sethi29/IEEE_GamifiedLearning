with open('src/features/science/physics/components/SoundLesson.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('const cycles = 1 + (freq / 100) * 4;', 'const cycles = 1 + ((freq - 100) / 900) * 9;')

with open('src/features/science/physics/components/SoundLesson.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
