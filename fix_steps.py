with open('src/features/science/physics/components/SoundLesson.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('TOTAL_STEPS = 6', 'TOTAL_STEPS = 5')
content = content.replace('case 5: // Quiz', 'case 4: // Quiz')
content = content.replace('case 6:', 'case 5:')
content = content.replace('{step < 5 && (', '{step < 4 && (')
content = content.replace('{step === 4 ? \"Start Knowledge Check\" : \"Next\"}', '{step === 3 ? \"Start Knowledge Check\" : \"Next\"}')

with open('src/features/science/physics/components/SoundLesson.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
