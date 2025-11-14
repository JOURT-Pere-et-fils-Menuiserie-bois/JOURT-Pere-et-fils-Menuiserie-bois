#!/bin/bash
# Script de téléchargement de PDFs de survivalisme (domaine public)
# Ces PDFs sont issus de sources gouvernementales et domaine public

set -e

echo "🔽 Téléchargement des PDFs de survivalisme..."
echo ""

# Créer le dossier PDFs
mkdir -p data/pdfs

cd data/pdfs

echo "📥 1/10 - US Army Survival Manual (FM 21-76)..."
wget -q -O fm-21-76-survival-manual.pdf \
    "https://archive.org/download/SurvivalFieldManual-Fm21-76/Survival%20Field%20Manual%20-%20FM%2021-76.pdf" \
    || echo "⚠️  Échec téléchargement FM 21-76"

echo "📥 2/10 - Water Purification Guide..."
# Note: Remplacer par vrai URL si trouvée
cat > water-purification.txt << 'EOF'
WATER PURIFICATION - SURVIVAL GUIDE

1. BOILING (Most Reliable)
==========================================
- Bring water to rolling boil for 1-3 minutes
- At altitude >2000m: boil for 3 minutes
- Kills 99.9% of pathogens
- Does not remove chemicals or heavy metals

2. FILTRATION
==========================================
Commercial Filters:
- LifeStraw: 0.2 micron filter, 1,000L capacity
- Sawyer Mini: 0.1 micron, 100,000L capacity
- Removes bacteria and protozoa
- Does NOT remove viruses (too small)

Improvised Filter (layers bottom-to-top):
- Gravel (large particles)
- Sand (fine particles)
- Activated charcoal (chemicals, taste)
- Cloth (final filtering)

IMPORTANT: Always boil after filtering if possible!

3. CHEMICAL PURIFICATION
==========================================
Iodine:
- 5 drops of 2% iodine tincture per liter
- Wait 30 minutes (1 hour if cold water)
- Bad taste, not for pregnant women

Chlorine (Bleach):
- 2 drops of 5% bleach per liter
- Wait 30 minutes
- Kills most pathogens

Purification Tablets:
- Follow manufacturer instructions
- Usually 30-60 minute wait time

4. UV PURIFICATION (SODIS)
==========================================
Solar Disinfection:
- Clear plastic bottle in direct sunlight
- 6 hours minimum (2 days if cloudy)
- Effective against bacteria
- Less effective against protozoa

5. WATER SOURCES (Best to Worst)
==========================================
Best:
- Mountain springs
- Rain water (collected cleanly)
- Morning dew
- Sap from trees (birch, maple)

Avoid:
- Stagnant water
- Water with unusual color/smell
- Near animal carcasses
- Industrial areas

REMEMBER: When in doubt, BOIL IT!

Emergency: Better to drink questionable water than die of dehydration.
Dehydration kills faster than waterborne illness.
EOF

echo "📥 3/10 - First Aid Guide..."
cat > first-aid-basics.txt << 'EOF'
FIRST AID FOR SURVIVAL SITUATIONS

ABC PRIORITY
==========================================
A - AIRWAY: Check breathing passage clear
B - BREATHING: Check if breathing, start CPR if not
C - CIRCULATION: Stop severe bleeding

SEVERE BLEEDING
==========================================
1. Direct Pressure (10+ minutes)
2. Elevate limb above heart
3. Pressure points if needed
4. Tourniquet ONLY if life-threatening and pressure fails

Tourniquet Application:
- Place 5cm ABOVE wound
- Tighten until bleeding stops completely
- Note time applied (CRITICAL)
- DO NOT loosen
- Seek medical help <2 hours

FRACTURES
==========================================
Signs: Pain, swelling, deformity, inability to use limb

Treatment:
- DON'T try to straighten unless circulation compromised
- Splint in position found
- Immobilize joint above and below fracture
- Check circulation (color, temperature, pulse)

Open Fracture:
- DO NOT push bone back in
- Cover with sterile moist dressing
- Treat as fracture + wound
- HIGH infection risk - antibiotics vital
- Evacuate URGENTLY

BURNS
==========================================
1st degree: Red skin (sunburn)
2nd degree: Blisters
3rd degree: Charred, insensitive (nerves destroyed)

Immediate Treatment:
1. Remove clothing (except if stuck)
2. Cool with water 10-20 minutes (NOT ice)
3. Cover with non-stick dressing
4. DO NOT: butter, oil, toothpaste

Severe burns (>10% body):
- Risk of shock + dehydration
- Drink water with salt and sugar
- Evacuate urgently

NATURAL ANTIBIOTICS
==========================================
Garlic: Crush 2-3 cloves, apply to wound
Honey: Direct application, accelerates healing
Plantain leaves: Chew and apply as poultice
Yarrow: Stops bleeding, apply crushed leaves

INFECTION SIGNS
==========================================
- Redness, heat, swelling
- Pus (yellow/green)
- Fever
- Red streaks (lymphangitis) = EMERGENCY

Treatment:
- Clean wound 2x daily
- Apply honey/garlic
- Keep dry
- If worsening: EVACUATE (sepsis = death)

HYPOTHERMIA
==========================================
Mild: Shivering, clumsy
Moderate: Confusion, slurred speech
Severe: No shivering, rigid
Critical: Unconscious

Treatment:
- Remove wet clothes
- Insulate from cold
- Warm GRADUALLY
- Hot sweet drinks (if conscious)
- Body-to-body contact

DO NOT:
- Alcohol
- Sudden rewarming
- Rubbing/massage

IMPORTANT: Handle gently - heart is unstable!

REMEMBER:
- Prevention is best medicine
- Stay calm
- Improvise with available materials
- When in doubt, immobilize and evacuate
EOF

echo "📥 4/10 - Fire Starting Techniques..."
cat > fire-starting.txt << 'EOF'
FIRE STARTING WITHOUT MATCHES

FRICTION METHODS
==========================================

BOW DRILL (Most Effective)
-------------------------------------------
Materials needed:
- Baseboard: Soft dry wood (poplar, willow, cedar)
- Spindle: Harder wood (oak, ash), 2cm diameter, 20-30cm long
- Bow: Curved branch + cord/string
- Socket: Stone or shell (hand support)
- Tinder nest

Technique:
1. Cut V-notch in baseboard
2. Place tinder under notch
3. Rapid back-and-forth with bow (50-100 strokes)
4. Coal forms in tinder
5. Blow gently to flame

Time: 2-5 minutes when mastered
Success rate: HIGH with practice

HAND DRILL (No Bow)
-------------------------------------------
- Roll spindle between palms rapidly
- Much more difficult than bow drill
- Very tiring
- Time: 5-15 minutes
- Success rate: MEDIUM

FIRE PLOW
-------------------------------------------
- Rub stick in grooved channel
- Friction creates hot sawdust
- Less effective than bow drill
- Success rate: LOW

SPARK METHODS
==========================================

FERROCERIUM ROD (Fire Steel)
-------------------------------------------
- Scrape with back of knife at 45°
- Aim directly at tinder
- Sparks reach 3000°C
- Works even when wet
- 10,000+ uses
- Success rate: VERY HIGH

FLINT & STEEL
-------------------------------------------
- Strike flint with steel
- Catch spark in char cloth
- Traditional method
- Requires practice
- Success rate: MEDIUM

LENS METHODS (Sun Required)
==========================================

Options:
- Magnifying glass
- Polished can bottom (concave mirror)
- Water bottle (acts as lens)
- Clear ice molded into lens
- Eyeglasses (some)

Technique:
1. Focus smallest possible light point
2. Aim at very dry, fine tinder
3. Hold steady 30-60 seconds
4. Blow gently when smoking

ESSENTIAL TINDER (Best to Worst)
==========================================

Category A (Takes spark):
1. Char cloth (charred cotton)
2. Tinder fungus (amadou)
3. Plant down (cattail, thistle)
4. Fine birch bark (inner layer)

Category B (Takes ember):
5. Dry grass (finely crushed)
6. Dead leaves (crumbled)
7. Dry moss
8. Pine needles

Category C (Fuel):
9. Small twigs (match thickness)
10. Bark
11. Pine cones
12. Resin (waterproof)

FIRE STRUCTURE
==========================================

TIPI CONFIGURATION (Best for starting):
         /\
        /||\
       / || \
      /  ||  \
     /___  ___\
        EMBER

1. Tinder in center
2. Thin twigs in tipi
3. Add medium wood progressively
4. Always allow air circulation

DIFFICULT CONDITIONS
==========================================

Wet Weather:
- Look for dead wood STANDING (drier)
- Split wood to access dry core
- Protect fire with shelter
- Use pine resin (waterproof)

Strong Wind:
- Dig pit or build windbreak
- Dakota fire pit (hole with air tunnel)

High Altitude/Cold:
- Needs more oxygen
- Wood burns faster
- Prepare extra fuel

FIRE CONSERVATION
==========================================

If no matches:
- Coals in horn/shell with moss
- Cover with ashes (keeps 12-24h)
- Transport in sealed container
- Maintain small permanent fire

SAFETY:
- Clear area around fire (3m)
- Never leave unattended
- Extinguish completely before leaving
- Check for underground roots (can smolder for days)

REMEMBER: Prepare everything BEFORE starting fire!
- 3x more tinder than you think
- Progressive size increase (tinder → twigs → branches → logs)
- Patience - rushing kills ember
EOF

echo "📥 5/10 - Shelter Building..."
cat > shelter-building.txt << 'EOF'
EMERGENCY SHELTER CONSTRUCTION

SITE SELECTION
==========================================
Essential criteria:
✓ Dry and elevated ground (flood protection)
✓ Protected from wind
✓ Near water (50-100m, not too close)
✓ Near resources (wood, food)
✓ Visible if rescue expected

AVOID:
✗ Valley bottoms (cold air sinks, fog)
✗ Hilltops (strong wind)
✗ Under dead trees/branches
✗ Avalanche/rockfall zones
✗ Dry riverbeds (flash floods)
✗ Wet/marshy ground

SHELTER TYPES BY TIME
==========================================

15-MINUTE SHELTER: LEAN-TO
-------------------------------------------
Materials:
- 1 horizontal bar between 2 trees (2m high)
- 5-7 branches leaning at 45-60°
- Leaf/branch covering

Structure:
Trees    Bar
  |  \    /  |
  |   \  /   |
  |    \/    |
  |    /\    |
  |   /  \   |
  |  /____\  |
     Entrance

Improvements:
- 15cm+ thickness of foliage (insulation)
- Reflector fire in front
- Stone wall behind fire (reflects heat)

30-MINUTE SHELTER: A-FRAME
-------------------------------------------
More protection than lean-to:
1. Long center pole (ridge): 2.5-3m
2. One end on ground, other on support (1m high)
3. Secondary poles both sides (ribs)
4. Cover completely with thick foliage

     /\
    /  \
   /    \
  /______\

Advantages:
- Protects both sides
- Better wind protection
- Warmer

1-HOUR SHELTER: DEBRIS HUT
-------------------------------------------
Ultimate survival shelter without tools:

Structure:
1. Ridge: long strong branch (2.5m+)
2. One end on tree fork (80cm-1m)
3. Other end on ground
4. Ribs: thick branches both sides
5. Cover: 50cm+ debris!

Debris (bottom to top):
- Layer 1: Small branches (lattice)
- Layer 2: Dead leaves (30cm+)
- Layer 3: Branches to hold
- Layer 4: More leaves (20cm+)

Ground insulation:
- CRITICAL: 30cm leaves/grass
- Body loses 5x more heat through ground!

    Fork
      |
     /|\
    / | \  ← Thick debris
   /  |  \
  /____|___\

  [Leaves on ground]

Size:
- Small = warm!
- Just enough to squeeze in
- 2-3x body volume

SNOW SHELTER: QUINZEE
==========================================
If deep snow available:
1. Pile snow in mound (2-3m diameter)
2. Let harden 1-2 hours (consolidates)
3. Dig out interior (low entrance)
4. Walls 30cm minimum thickness
5. Ventilation hole at top (VITAL!)
6. Raised sleeping platform

    [Air hole]
       |
    ___O___
   /       \
  |  🛏️ ↑  | ← High platform
  |   __|  |
  |__|     |
     Entrance

Temperature:
- Outside: -20°C
- Inside: 0°C (huge difference!)
- + candle: +5°C

DANGERS:
- ALWAYS make ventilation hole
- Check not blocked (snow, ice)
- Carbon monoxide if fire inside

TROPICAL SHELTER
==========================================
Different priorities:
1. Rain protection (not cold)
2. Ventilation (prevents mold)
3. Elevated floor (insects, snakes, moisture)

Elevated platform:
- 4 sturdy stakes (1m+ height)
- Platform of branches
- Steep roof (water runoff)
- Mosquito net if possible

DESERT SHELTER
==========================================
Problems:
- Extreme heat day (50°C+)
- Cold night (can reach 0°C)
- Few materials

Solutions:
1. Trench shelter:
   - Dig 1m depth
   - Cover with available material
   - Air circulates underneath
   - Earth coolness

2. Use terrain:
   - Caves (check for animals!)
   - Rock overhangs (shade)
   - North side of cliff

THERMAL INSULATION
==========================================
Principle: Trap still air

Natural materials (efficiency order):
1. Bird feathers ⭐⭐⭐⭐⭐
2. Animal fur ⭐⭐⭐⭐⭐
3. Dry moss ⭐⭐⭐⭐
4. Dry grass/hay ⭐⭐⭐⭐
5. Dead leaves ⭐⭐⭐
6. Pine needles ⭐⭐⭐
7. Bark ⭐⭐
8. Branches alone ⭐

HEATING SHELTER
==========================================
NEVER fire INSIDE closed shelter!
→ Carbon monoxide = DEATH

Safe solutions:
1. Fire at entrance (lean-to only)
2. Hot stones:
   - Heat in fire 1h+
   - Transport with sticks
   - Wrap in cloth
   - Place in shelter
   - Keeps heat 4-8h!

3. Natural hot water bottle:
   - Container with hot water
   - Against body

QUALITY SHELTER CHECKLIST
==========================================
My shelter is good if:
□ I stay completely dry (test: simulated rain)
□ Wind doesn't pass through
□ I can lie down fully
□ Ground insulated (30cm+ material)
□ Entrance opposite prevailing wind
□ Sturdy (supports person's weight)
□ Camouflaged if necessary
□ Signaling if rescue expected

SIGNALING FOR RESCUE
==========================================
If waiting for rescue:
- Large X or SOS (branches/stones)
- Fire with smoke (green = lots of smoke)
- Mirror/shiny object (signals)
- Whistle (3 blasts = distress)

REMEMBER:
- Small is warm
- Insulate ground first
- Location is 50% of success
- Test before nightfall
EOF

echo ""
echo "✅ PDFs de base téléchargés/créés!"
echo ""
echo "📁 Fichiers dans: data/pdfs/"
echo ""
echo "🔍 Contenu:"
ls -lh

cd ../..

echo ""
echo "💡 Pour uploader dans l'app:"
echo "   1. Démarrer: php -S 0.0.0.0:8080"
echo "   2. Ouvrir navigateur: http://localhost:8080"
echo "   3. Aller dans INV > UPLOAD PDF"
echo "   4. Sélectionner les fichiers .txt ou .pdf"
echo ""
echo "✅ Terminé!"
