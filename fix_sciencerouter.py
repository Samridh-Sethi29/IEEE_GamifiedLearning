with open('src/features/science/ScienceRouter.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'import PhysicsRouter from "./physics/PhysicsRouter";',
    'import PhysicsRouter from "./physics/PhysicsRouter";\nimport ChemistryRouter from "./chemistry/ChemistryRouter";'
)

content = content.replace(
    '<Route path="physics/*" element={<PhysicsRouter />} />',
    '<Route path="physics/*" element={<PhysicsRouter />} />\n      <Route path="chemistry/*" element={<ChemistryRouter />} />'
)

with open('src/features/science/ScienceRouter.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated ScienceRouter")
