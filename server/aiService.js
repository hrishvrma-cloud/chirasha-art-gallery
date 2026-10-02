const db = require('./db');
const { v4: uuidv4 } = require('uuid');

// Curated pedagogical curriculum matrix for diverse art mediums & age-appropriate themes
const CURRICULUM_MATRIX = [
  {
    medium: 'Oil Pastels & Scratch Art (Sgraffito)',
    target_age: '6 - 12 Years',
    themes: [
      {
        title: 'Neon Night Sky & Owl Silhouette (Sgraffito)',
        rationale: 'Builds tactile hand-strength and teaches contrast. Children learn color layering under dark coatings and scratch-reveal methods.',
        materials: ['Heavy oil pastels (bright rainbow colors)', 'Black tempera or acrylic paint', 'Drop of liquid dish soap', 'Toothpicks or wooden styluses', 'Heavy cardstock'],
        steps: [
          'Step 1: Color bright, saturated rainbow patches covering 100% of the paper with zero white spots.',
          'Step 2: Brush a smooth layer of black paint mixed with a drop of soap over the entire surface.',
          'Step 3: Wait 8-10 minutes to dry completely.',
          'Step 4: Use wooden toothpicks to scratch whimsical tree branches, owls, and glowing stars—revealing rainbow colors underneath!'
        ],
        pitch: '✨ Magic Scratch Art Weekend! Watch your young artist reveal a glowing neon night sky from black canvas. Perfect for Saturday morning!'
      },
      {
        title: 'Deep Ocean Bioluminescent Jellyfish',
        rationale: 'Explores warm vs. cool contrast. Teaches students how light reflects underwater using pastel blending and white scratch accents.',
        materials: ['Soft oil pastels (blues, purples, cyans, neon pinks)', 'Black pastel sheet', 'Blending stumps or cotton buds', 'White gel pen / scratch tool'],
        steps: [
          'Step 1: Draw translucent bell shapes of jellyfish using light cyan and neon magenta.',
          'Step 2: Blend tentacles outward in soft wavy strokes using cotton buds.',
          'Step 3: Scratch or dot bubble trails and luminous light speckles around deep sea creatures.'
        ],
        pitch: '🌊 Dive deep into bioluminescent ocean art! Your child will craft glowing deep-sea wonders with tactile oil pastels this weekend.'
      }
    ]
  },
  {
    medium: 'Terracotta & Air-Dry Clay Sculpting',
    target_age: '6 - 14 Years',
    themes: [
      {
        title: 'Miniature Woodland Animal Trinket Dishes & Plaques',
        rationale: 'Transitions students from 2D plane to 3D spatial thinking. Focuses on slab-building, pinch-pot techniques, and fine surface texture.',
        materials: ['White air-dry clay (250g per child)', 'Rolling pins & wooden guides', 'Clay carving tools / toothpicks', 'Small water sponge', 'Acrylic wash for detailing'],
        steps: [
          'Step 1: Roll out an even 1.5 cm thick slab using rolling pins.',
          'Step 2: Shape outer edges into a leaf or animal silhouette and pinch the rims upward into a shallow dish.',
          'Step 3: Sculpt 3D ears, nose, and texture using scoring and slip (water bonding).',
          'Step 4: Imprint child’s monogram stamp and let set for painting next session.'
        ],
        pitch: '🐾 Hands-on Clay Sculpting Camp! Kids transform soft clay into adorable keepsake animal dishes. Zero mess stress—all materials provided!'
      },
      {
        title: 'Heritage Terracotta Diya & Festive Lanterns',
        rationale: 'Celebrates traditional handicraft aesthetics while teaching hollow-form pinch pottery and perforated light-hole carving.',
        materials: ['Terracotta air-dry clay', 'Straws for punch holes', 'Clay modeling knives', 'Gold acrylic metallic paint & mirror sparkles'],
        steps: [
          'Step 1: Create a classic hollow sphere pinch-pot.',
          'Step 2: Carve ornate petal openings and punch rhythmic circular light-holes.',
          'Step 3: Add delicate beaded clay rims around the candle base.',
          'Step 4: Dry and highlight with traditional gold metallic dry-brush strokes.'
        ],
        pitch: '🪔 Festive Clay Lanterns Workshop! Light up your home with an authentic clay diya sculpted with love by your young artist.'
      }
    ]
  },
  {
    medium: 'Traditional Indian Folk Art (Madhubani / Warli / Gond)',
    target_age: '7 - 14 Years',
    themes: [
      {
        title: 'Gond Folk Art: Tree of Life & Forest Deer',
        rationale: 'Introduces indigenous storytelling and repetitive line patterning (dhingra dots and dashed textures). Teaches rhythm and discipline in art.',
        materials: ['Black archival fineliners (0.5mm)', 'Bright poster paints / gouache (Mustard yellow, Forest green, Burnt sienna)', 'Handmade ivory paper (250 GSM)'],
        steps: [
          'Step 1: Outline the curved organic branches of the sacred Mahua tree and grazing deer.',
          'Step 2: Fill flat earthy blocks of warm yellows and rich greens.',
          'Step 3: Use fineliners or toothpick tips to apply iconic Gond parallel dashed line fills and rhythmic dots across bodies.'
        ],
        pitch: '🌿 Explore the magic of Indian Folk Art! Learn Gond patterns and the sacred Tree of Life in our weekend cultural heritage series.'
      },
      {
        title: 'Warli Village Festivity Mural on Kraft Paper',
        rationale: 'Focuses on ancient prehistoric geometric figures (triangles, circles, lines) to tell vibrant communal celebration stories.',
        materials: ['Brown rustic kraft paper', 'White opaque gouache / acrylic ink', 'Fine round brush #1 and #0', 'Bamboo stylus'],
        steps: [
          'Step 1: Understand Warli symbology: Circle = Sun/Moon, Triangle = Mountains/Trees, Two opposite triangles = Human torso.',
          'Step 2: Paint the central Tarpa spiral dance with connected dancing figures.',
          'Step 3: Frame the composition with geometric chevron and wheat-stalk borders.'
        ],
        pitch: '🥁 Warli Folk Art Discovery! Kids turn simple geometric shapes into bustling village festival stories with crisp white ink.'
      }
    ]
  },
  {
    medium: 'Watercolor Fluidity & Negative Space',
    target_age: '6 - 14 Years',
    themes: [
      {
        title: 'Misty Alpine Pine Forest with Negative Silhouette',
        rationale: 'Teaches atmospheric perspective and tonal values (light foreground wash vs. dark background trees). Demonstrates control of water saturation.',
        materials: ['Cold-press 300 GSM watercolor paper', 'Prussian blue, Viridian green, and Paynes grey pigments', 'Mop brush & rigger brush', 'Tissue dabbers'],
        steps: [
          'Step 1: Lay a very faint watery cerulean wash at the top for foggy skies.',
          'Step 2: While semi-damp, paint distant pale misty pine trees.',
          'Step 3: Allow to dry, then paint crisp, deep dark foreground fir trees with crisp needle textures.',
          'Step 4: Splatter fine clean water drops to create subtle floating mist blooms.'
        ],
        pitch: '🌲 Misty Pines Watercolor Workshop! Learn the secrets of watercolor fog, depth, and layered forest silhouettes this Saturday.'
      }
    ]
  },
  {
    medium: 'Botanical Illustration & Mixed Media Collage',
    target_age: '7 - 14 Years',
    themes: [
      {
        title: 'Vintage Botanical Pressed-Leaf & Gouache Herbarium',
        rationale: 'Connects nature observation with scientific curiosity and art. Combines pressed textures with crisp botanical brushwork.',
        materials: ['Botanical watercolor or gouache', 'Vintage tea-stained paper', 'Calligraphy pen or 0.3mm fine marker', 'Fresh leaves / botanical specimens for observation'],
        steps: [
          'Step 1: Examine real plant leaf venation under a magnifying glass.',
          'Step 2: Sketch accurate leaf contours and flower petals.',
          'Step 3: Paint translucent gouache color matching real botanical tones.',
          'Step 4: Annotate with Latin names and personal artistic notes in calligraphy.'
        ],
        pitch: '🍃 Little Naturalist Art Workshop! Combine science and artistic painting in our botanical illustration weekend session.'
      }
    ]
  }
];

class AIService {
  /**
   * Generates tailored activity suggestions by analyzing recent classroom history.
   * If an explicit topic / medium is passed, it customizes suggestions for that medium.
   */
  async generateSuggestions(customTopic = null, targetAge = null) {
    // 1. Fetch recent activity history from the database to see what madam taught recently
    const recentActivities = db.prepare(`
      SELECT medium, title, technique, created_at 
      FROM activity_posts 
      ORDER BY created_at DESC 
      LIMIT 6
    `).all();

    const usedMediums = new Set(recentActivities.map(a => a.medium.toLowerCase()));

    // 2. Select curriculum themes that offer variety and pedagogical freshness
    let candidateThemes = [];

    if (customTopic) {
      // Find matching or relevant themes
      const lower = customTopic.toLowerCase();
      for (const item of CURRICULUM_MATRIX) {
        if (item.medium.toLowerCase().includes(lower)) {
          candidateThemes.push(...item.themes.map(t => ({ ...t, medium: item.medium, target_age: item.target_age })));
        }
      }
    }

    // If no explicit matches, pick themes from mediums not used in the last 2-3 sessions
    if (candidateThemes.length === 0) {
      for (const item of CURRICULUM_MATRIX) {
        const isRecentlyUsed = Array.from(usedMediums).some(m => item.medium.toLowerCase().includes(m) || m.includes(item.medium.toLowerCase()));
        
        // Prioritize mediums that haven't been done recently
        for (const t of item.themes) {
          candidateThemes.push({
            ...t,
            medium: item.medium,
            target_age: item.target_age,
            score: isRecentlyUsed ? 1 : 3 // Higher score for fresh mediums
          });
        }
      }

      // Sort by freshness score
      candidateThemes.sort((a, b) => b.score - a.score);
    }

    // Pick top 2 distinct themes
    const selected = candidateThemes.slice(0, 2);

    const generated = [];
    for (const item of selected) {
      const id = 'sug-' + uuidv4().substring(0, 8);
      const row = {
        id,
        title: item.title,
        medium: item.medium,
        target_age: targetAge || item.target_age,
        rationale: item.rationale,
        materials_needed: JSON.stringify(item.materials),
        step_by_step: JSON.stringify(item.steps),
        promotional_pitch: item.pitch,
        status: 'suggested',
        created_at: new Date().toISOString()
      };

      db.prepare(`
        INSERT INTO ai_suggestions (id, title, medium, target_age, rationale, materials_needed, step_by_step, promotional_pitch, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(row.id, row.title, row.medium, row.target_age, row.rationale, row.materials_needed, row.step_by_step, row.promotional_pitch, row.status, row.created_at);

      generated.push({
        ...row,
        materials_needed: item.materials,
        step_by_step: item.steps
      });
    }

    return generated;
  }

  /**
   * Fetch all past suggestions
   */
  getSuggestions() {
    const rows = db.prepare('SELECT * FROM ai_suggestions ORDER BY created_at DESC').all();
    return rows.map(r => ({
      ...r,
      materials_needed: JSON.parse(r.materials_needed || '[]'),
      step_by_step: JSON.parse(r.step_by_step || '[]')
    }));
  }

  /**
   * Accept an AI suggestion and automatically convert it into an upcoming session draft!
   */
  acceptSuggestion(id, scheduledDate = null, timeSlot = '10:00 AM - 11:30 AM') {
    const sug = db.prepare('SELECT * FROM ai_suggestions WHERE id = ?').get(id);
    if (!sug) throw new Error('Suggestion not found');

    db.prepare("UPDATE ai_suggestions SET status = 'accepted' WHERE id = ?").run(id);

    // Create a new session automatically from this suggestion!
    const sessionId = 'sess-' + uuidv4().substring(0, 8);
    const date = scheduledDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO sessions (id, title, type, date, start_time, end_time, location, max_seats, age_group, status, created_at)
      VALUES (?, ?, 'weekend', ?, ?, ?, 'Studio Main Hall', 12, ?, 'upcoming', ?)
    `).run(
      sessionId,
      sug.title,
      date,
      timeSlot.split('-')[0].trim(),
      timeSlot.split('-')[1]?.trim() || '11:30 AM',
      sug.target_age,
      new Date().toISOString()
    );

    return { sessionId, title: sug.title, date };
  }
}

module.exports = new AIService();
