with open('src/features/science/physics/components/ForceMotionLesson.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('className="text-6xl z-10"', 'className="text-6xl z-10 inline-block scale-x-[-1]"', 1)
content = content.replace('className="absolute text-5xl"', 'className="absolute text-5xl inline-block scale-x-[-1]"', 2)
content = content.replace('className="text-6xl z-10 relative"', 'className="text-6xl z-10 relative inline-block scale-x-[-1]"', 1)
content = content.replace('className="text-5xl"', 'className="text-5xl inline-block scale-x-[-1]"', 2)

with open('src/features/science/physics/components/ForceMotionLesson.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done fixing emojis")
