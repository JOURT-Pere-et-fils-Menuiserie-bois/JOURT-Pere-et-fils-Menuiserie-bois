/**
 * Module SURVIE URBAINE - Tactiques ville, accès, mobilité
 * URGENCE ET ÉDUCATION UNIQUEMENT
 */

const UrbanSurvivalModule = {
    id: 'urban-survival',
    name: 'URBAN OPS',
    icon: '🏙️',

    state: {
        selectedCategory: 'entry',
        bookmarks: []
    },

    categories: {
        entry: {
            name: 'ACCÈS',
            techniques: [
                {
                    title: 'Portes Standards',
                    methods: [
                        {
                            name: 'Carte plastique (Shimming)',
                            target: 'Loquets à ressort sans verrou additionnel',
                            tools: 'Carte bancaire périmée, radiographie',
                            steps: [
                                '1. Identifier type de loquet (ressort/deadbolt)',
                                '2. Glisser carte entre porte et chambranle',
                                '3. Angle 45° vers loquet',
                                '4. Pousser en maintenant pression',
                                '5. Tourner poignée simultanément'
                            ],
                            effectiveness: '80% portes intérieures, 30% extérieures',
                            time: '5-30 secondes',
                            traces: 'Aucune si bien fait',
                            defense: 'Deadbolt, gâche renforcée'
                        },
                        {
                            name: 'Bumping / Shouldering',
                            target: 'Portes mal installées ou vieilles',
                            method: 'Impact épaule près de la serrure',
                            technique: [
                                'Coup sec et puissant',
                                'Viser 15cm au-dessus de la poignée',
                                'Simultané avec pression poignée',
                                'Répéter si nécessaire'
                            ],
                            risk: 'Bruyant, laisse marques, peut blesser',
                            effectiveness: '60% portes standards mal fixées'
                        },
                        {
                            name: 'Défaut d\'Installation',
                            exploits: [
                                'Vis gâche trop courtes (arracher)',
                                'Jeu excessif porte/cadre',
                                'Paumelles externes (démonter)',
                                'Jour sous la porte (crochet/fil)'
                            ]
                        }
                    ]
                },
                {
                    title: 'Fenêtres',
                    methods: [
                        {
                            name: 'Fenêtres à Guillotine',
                            technique: 'Lame fine entre panneaux, lever loquet',
                            tools: 'Couteau fin, carte rigide',
                            notes: 'Modèles anciens sans sécurité moderne'
                        },
                        {
                            name: 'Fenêtres Coulissantes',
                            exploits: [
                                'Soulever et sortir du rail',
                                'Déverrouiller loquet par écart',
                                'Forcer rail si plastique'
                            ],
                            defense: 'Barre dans rail, vis blocage'
                        },
                        {
                            name: 'Bris de Vitrage',
                            lastResort: true,
                            methods: [
                                'Coin inférieur (moins de bruit)',
                                'Couvrir avec vêtement (étouffer son)',
                                'Utiliser objet dur et pointu',
                                'Enlever éclats pour passage'
                            ],
                            risks: 'Bruyant, traces, blessures, ILLÉGAL',
                            urgent: 'Seulement urgence vitale'
                        }
                    ]
                },
                {
                    title: 'Accès Toit/Sous-Sol',
                    routes: [
                        'Échelles de secours (fire escapes)',
                        'Toits plats adjacents',
                        'Soupiraux et aérations',
                        'Trappes de livraison',
                        'Parkings souterrains'
                    ],
                    caution: 'Souvent moins sécurisés mais risqués (chutes)'
                }
            ]
        },
        vehicles: {
            name: 'VÉHICULES',
            skills: [
                {
                    title: 'Hot-Wiring (Court-Circuit Démarrage)',
                    disclaimer: 'VOTRE véhicule en situation d\'urgence UNIQUEMENT',
                    applicable: 'Véhicules pré-1990 principalement',
                    modern: 'Véhicules modernes: IMPOSSIBLE (puce RFID)',

                    classic: {
                        name: 'Méthode Classique (pré-1990)',
                        tools: 'Tournevis, dénudeur de câbles',
                        wires: [
                            'ROUGE - Batterie (12V constant)',
                            'JAUNE/MARRON - Accessoires',
                            'NOIR/BLANC - Terre',
                            'VERT/VIOLET - Démarreur'
                        ],
                        steps: [
                            '1. Retirer cache colonne direction',
                            '2. Identifier faisceau allumage',
                            '3. Couper faisceau, dénuder fils',
                            '4. Torsader ROUGE + JAUNE = Contact',
                            '5. Toucher VERT au ROUGE brièvement = Démarrage',
                            '6. Séparer VERT immédiatement après démarrage'
                        ],
                        dangers: [
                            '⚡ Choc électrique possible',
                            '🔥 Court-circuit = incendie',
                            '🚨 Système anti-vol peut bloquer',
                            '⚖️ ILLÉGAL sauf votre véhicule'
                        ]
                    },

                    modern: {
                        name: 'Véhicules Modernes (post-2000)',
                        reality: 'Hot-wiring ne fonctionne PAS',
                        reasons: [
                            'Puce transpondeur dans clé',
                            'ECU vérifie code avant démarrage',
                            'Verrouillage colonne électronique',
                            'Système CAN Bus crypté'
                        ],
                        alternatives: [
                            'Appeler dépanneuse (légal)',
                            'Serrurier automobile agréé',
                            'Programmation clé de remplacement'
                        ]
                    },

                    emergency: {
                        name: 'Urgence Réelle',
                        scenarios: [
                            'Clés enfermées dans votre voiture',
                            'Accident avec véhicule bloqué',
                            'Situation de survie extrême'
                        ],
                        methods: [
                            'Cintre métallique par fenêtre',
                            'Wedge gonflable + tige',
                            'Bris vitre latérale (dernier recours)'
                        ]
                    }
                },
                {
                    title: 'Ouverture Véhicule Sans Clé',
                    methods: [
                        {
                            name: 'Slim Jim',
                            target: 'Voitures avec mécanisme tige vertical',
                            tool: 'Lame métallique plate longue',
                            technique: 'Glisser entre vitre et joint, accrocher tige',
                            modern: 'Ne fonctionne plus sur véhicules récents'
                        },
                        {
                            name: 'Wedge + Tige',
                            tools: 'Cale gonflable, tige longue',
                            steps: [
                                '1. Insérer wedge coin supérieur porte',
                                '2. Gonfler pour créer écart',
                                '3. Insérer tige longue',
                                '4. Accrocher verrou intérieur',
                                '5. Tirer pour déverrouiller'
                            ],
                            legal: 'Outils professionnels serrurier',
                            risk: 'Peut endommager joint de porte'
                        },
                        {
                            name: 'Décodage Radiofréquence',
                            target: 'Systèmes keyless entry',
                            reality: 'Nécessite équipement SDR complexe',
                            methods: [
                                'Replay attack (enregistrer signal)',
                                'Jamming + capture code',
                                'Amplification signal (relais)'
                            ],
                            defense: 'Cage Faraday pour clés, rolling codes',
                            legality: 'TRÈS ILLÉGAL - Jamming interdit partout'
                        }
                    ]
                },
                {
                    title: 'Véhicules Deux-Roues',
                    motorcycles: [
                        'Antivol U: très difficile (meuleuse)',
                        'Chaîne: idem, qualité variable',
                        'Antivol disque: contournable',
                        'Neiman: crochetable sur anciens modèles'
                    ],
                    bicycles: [
                        'Câbles: cisaille suffit',
                        'U-lock: attaque par gel ou meuleuse',
                        'Antivols combinaison: crack possible'
                    ],
                    note: 'Défense: toujours combiner plusieurs antivols'
                }
            ]
        },
        movement: {
            name: 'DÉPLACEMENT',
            tactics: [
                {
                    title: 'Déplacement Furtif Urbain',
                    principles: [
                        'Rester dans ombres et zones peu éclairées',
                        'Éviter ligne de vue directe',
                        'Utiliser obstacles comme masques',
                        'Déplacement lent et contrôlé',
                        'Vêtements sombres non-réfléchissants'
                    ],
                    techniques: [
                        {
                            name: 'Shadow Hugging',
                            description: 'Coller aux murs dans zones sombres',
                            tip: 'Rester immobile si détecté = se fondre'
                        },
                        {
                            name: 'Broken Silhouette',
                            description: 'Casser forme humaine reconnaissable',
                            method: 'Se baisser, utiliser objets comme masque'
                        },
                        {
                            name: 'Sound Discipline',
                            description: 'Minimiser bruit',
                            tips: [
                                'Pas talon vers pointe',
                                'Tester sol avant de poser poids',
                                'Éviter objets métalliques cliquetants',
                                'Respiration contrôlée'
                            ]
                        }
                    ]
                },
                {
                    title: 'Franchissement Obstacles',
                    obstacles: [
                        {
                            type: 'Clôtures grillage',
                            methods: [
                                'Escalade rapide (si <3m)',
                                'Cisaille section basse',
                                'Passage sous si jeu au sol'
                            ],
                            detection: 'Grillage métallique = vibrations'
                        },
                        {
                            type: 'Murs hauts',
                            techniques: [
                                'Wall run + traction',
                                'Appui sur mobilier urbain',
                                'Binôme (faire la courte échelle)',
                                'Corde avec grappin'
                            ]
                        },
                        {
                            type: 'Barbelés',
                            safety: [
                                'Toujours veste épaisse par-dessus',
                                'Tapis/couverture sur barbelés',
                                'Éviter concertina (trop dangereux)',
                                'Jamais précipitation = blessures'
                            ]
                        }
                    ]
                },
                {
                    title: 'Parkour/Freerunning Urbain',
                    skills: [
                        'Saut de précision (precision jump)',
                        'Réception roulée (parkour roll)',
                        'Franchissement (vault)',
                        'Cat leap (saut agrippé)',
                        'Wall run'
                    ],
                    training: 'NÉCESSITE entraînement intensif - risque chutes',
                    survival: 'Mobilité = survie en milieu urbain hostile'
                }
            ]
        },
        observation: {
            name: 'OBSERVATION',
            skills: [
                {
                    title: 'Counter-Surveillance',
                    definition: 'Détecter surveillance hostile',
                    techniques: [
                        {
                            name: 'SDR (Surveillance Detection Route)',
                            description: 'Itinéraire pour révéler filature',
                            elements: [
                                'Changements direction brusques',
                                'Passages lieux à entrée unique',
                                'Stops soudains avec observation',
                                'Reflets vitres/miroirs'
                            ]
                        },
                        {
                            name: 'Pattern Recognition',
                            indicators: [
                                'Même personne vue 3+ fois',
                                'Véhicule suivant plusieurs rues',
                                'Personnes communiquant (oreillettes)',
                                'Comportement inhabituel (fixer puis détourner)'
                            ]
                        },
                        {
                            name: 'Dry Cleaning',
                            description: 'Se débarrasser d\'une filature',
                            methods: [
                                'Transports en commun (sortie dernière seconde)',
                                'Grands magasins (entrées multiples)',
                                'Changement vêtements/apparence',
                                'Lieux bondés (se fondre)'
                            ]
                        }
                    ]
                },
                {
                    title: 'Reconnaissance Urbaine',
                    objectives: [
                        'Identifier voies d\'évacuation',
                        'Repérer points eau/nourriture',
                        'Cartographier zones de danger',
                        'Localiser abris potentiels'
                    ],
                    method: [
                        'Observation discrète',
                        'Mémorisation ou croquis mental',
                        'Photos si sécurisé',
                        'Ne jamais paraître suspect'
                    ]
                },
                {
                    title: 'Caméras de Surveillance',
                    evasion: [
                        'Identifier angles morts',
                        'Capuche + tête baissée (masque visage)',
                        'Maquillage/faux tatouages (confusion)',
                        'Reflets IR (certains tissus)',
                        'Éviter fixation caméra = suspect'
                    ],
                    reality: 'En ville moderne = presque impossible d\'éviter toutes caméras',
                    note: 'Mieux: ne rien faire d\'illégal'
                }
            ]
        },
        resources: {
            name: 'RESSOURCES',
            urban: [
                {
                    title: 'Eau en Ville',
                    sources: [
                        'Fontaines publiques',
                        'Chauffe-eau immeubles abandonnés',
                        'Réservoirs WC (si propre)',
                        'Climatiseurs (condensation)',
                        'Gouttières après pluie'
                    ],
                    purification: 'TOUJOURS purifier (ébullition, filtre, chimique)'
                },
                {
                    title: 'Nourriture Urbaine',
                    sources: [
                        'Dumpster diving (poubelles supermarchés)',
                        'Plantes comestibles urbaines',
                        'Pigeons/rats (cuisson complète)',
                        'Jardins communautaires',
                        'Distribution alimentaire'
                    ],
                    timing: 'Supermarchés jettent après fermeture'
                },
                {
                    title: 'Abri Urbain',
                    options: [
                        'Bâtiments abandonnés',
                        'Parkings souterrains',
                        'Tunnels/égouts (danger!)',
                        'Ponts/viaducs',
                        'Foyers d\'urgence'
                    ],
                    safety: [
                        'Éviter squats connus (violence)',
                        'Toujours repérer sorties',
                        'Cacher présence',
                        'Rotation locations'
                    ]
                }
            ]
        }
    },

    async init() {
        console.log('[UrbanSurvival] Module initialized');
        this.loadState();
    },

    render() {
        const category = this.categories[this.state.selectedCategory];

        return `
            <div class="module urban-module">
                <div class="module-header">
                    <h2 class="module-title">${this.icon} ${this.name}</h2>
                    <div class="warning-badge extreme">
                        ⚠️ URGENCE UNIQUEMENT
                    </div>
                </div>

                <div class="disclaimer critical">
                    <strong>🚨 AVERTISSEMENT CRITIQUE</strong>
                    <p><strong>CES TECHNIQUES SONT ILLÉGALES SANS AUTORISATION</strong></p>
                    <p>Usage uniquement en situation survie extrême ou sur votre propriété.</p>
                    <p>Effraction, vol véhicule, intrusion = DÉLITS GRAVES.</p>
                    <p>Information éducative et préparation urgence UNIQUEMENT.</p>
                </div>

                <div class="urban-nav">
                    ${Object.keys(this.categories).map(key => `
                        <button class="nav-btn ${key === this.state.selectedCategory ? 'active' : ''}"
                                onclick="UrbanSurvivalModule.selectCategory('${key}')">
                            ${this.categories[key].name}
                        </button>
                    `).join('')}
                </div>

                <div class="urban-content">
                    ${this.renderCategory(category)}
                </div>
            </div>
        `;
    },

    renderCategory(category) {
        const key = this.state.selectedCategory;

        if (key === 'entry') {
            return category.techniques.map(section => `
                <div class="stat-card">
                    <h3>${section.title}</h3>
                    ${section.methods.map(method => `
                        <div class="method-section">
                            <h4>${method.name}</h4>
                            ${method.target ? `<p><strong>Cible:</strong> ${method.target}</p>` : ''}
                            ${method.tools ? `<p><strong>Outils:</strong> ${method.tools}</p>` : ''}

                            ${method.steps ? `
                                <div class="steps-list">
                                    ${method.steps.map(s => `<div class="step-item">${s}</div>`).join('')}
                                </div>
                            ` : ''}

                            ${method.technique ? `
                                ${Array.isArray(method.technique) ? `
                                    <ul>
                                        ${method.technique.map(t => `<li>${t}</li>`).join('')}
                                    </ul>
                                ` : `<p>${method.technique}</p>`}
                            ` : ''}

                            ${method.exploits ? `
                                <div class="exploits-list">
                                    <strong>Exploits:</strong>
                                    <ul>
                                        ${method.exploits.map(e => `<li>${e}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}

                            ${method.methods ? `
                                <div class="methods-list">
                                    <ul>
                                        ${method.methods.map(m => `<li>${m}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}

                            ${method.effectiveness ? `<p><strong>Efficacité:</strong> ${method.effectiveness}</p>` : ''}
                            ${method.time ? `<p><strong>Temps:</strong> ${method.time}</p>` : ''}
                            ${method.traces ? `<p><strong>Traces:</strong> ${method.traces}</p>` : ''}
                            ${method.defense ? `<p><strong>Défense:</strong> ${method.defense}</p>` : ''}
                            ${method.risk ? `<div class="warning-box">${method.risk}</div>` : ''}
                            ${method.risks ? `<div class="warning-box">${method.risks}</div>` : ''}
                            ${method.urgent ? `<div class="urgent-box">${method.urgent}</div>` : ''}
                            ${method.notes ? `<div class="notes-box">${method.notes}</div>` : ''}
                        </div>
                    `).join('')}

                    ${section.routes ? `
                        <div class="routes-list">
                            <strong>Routes alternatives:</strong>
                            <ul>
                                ${section.routes.map(r => `<li>${r}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${section.caution ? `<div class="warning-box">${section.caution}</div>` : ''}
                </div>
            `).join('');
        }

        if (key === 'vehicles') {
            return category.skills.map(skill => `
                <div class="stat-card">
                    <h3>${skill.title}</h3>
                    ${skill.disclaimer ? `<div class="disclaimer-box">${skill.disclaimer}</div>` : ''}
                    ${skill.applicable ? `<p><strong>Applicable:</strong> ${skill.applicable}</p>` : ''}
                    ${skill.modern ? `<p><strong>Véhicules modernes:</strong> ${skill.modern}</p>` : ''}

                    ${skill.classic ? `
                        <div class="classic-method">
                            <h4>${skill.classic.name}</h4>
                            ${skill.classic.tools ? `<p><strong>Outils:</strong> ${skill.classic.tools}</p>` : ''}

                            ${skill.classic.wires ? `
                                <div class="wires-list">
                                    <strong>Identification fils:</strong>
                                    ${skill.classic.wires.map(w => `<div><code>${w}</code></div>`).join('')}
                                </div>
                            ` : ''}

                            ${skill.classic.steps ? `
                                <div class="steps-list">
                                    <strong>PROCÉDURE:</strong>
                                    ${skill.classic.steps.map(s => `<div class="step-item">${s}</div>`).join('')}
                                </div>
                            ` : ''}

                            ${skill.classic.dangers ? `
                                <div class="dangers-box critical">
                                    <strong>⚠️ DANGERS:</strong>
                                    ${skill.classic.dangers.map(d => `<div>${d}</div>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}

                    ${skill.modern ? (typeof skill.modern === 'object' ? `
                        <div class="modern-reality">
                            <h4>${skill.modern.name}</h4>
                            <p><strong>${skill.modern.reality}</strong></p>

                            ${skill.modern.reasons ? `
                                <div class="reasons-list">
                                    <strong>Raisons:</strong>
                                    <ul>
                                        ${skill.modern.reasons.map(r => `<li>${r}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}

                            ${skill.modern.alternatives ? `
                                <div class="alternatives-list">
                                    <strong>Alternatives légales:</strong>
                                    <ul>
                                        ${skill.modern.alternatives.map(a => `<li>${a}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    ` : '') : ''}

                    ${skill.emergency ? `
                        <div class="emergency-section">
                            <h4>${skill.emergency.name}</h4>
                            <div class="scenarios">
                                <strong>Scénarios légitimes:</strong>
                                <ul>
                                    ${skill.emergency.scenarios.map(s => `<li>${s}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="methods">
                                <strong>Méthodes:</strong>
                                <ul>
                                    ${skill.emergency.methods.map(m => `<li>${m}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    ` : ''}

                    ${skill.methods ? `
                        ${skill.methods.map(method => `
                            <div class="vehicle-method">
                                <h4>${method.name}</h4>
                                ${method.target ? `<p><strong>Cible:</strong> ${method.target}</p>` : ''}
                                ${method.tool ? `<p><strong>Outil:</strong> ${method.tool}</p>` : ''}
                                ${method.tools ? `<p><strong>Outils:</strong> ${method.tools}</p>` : ''}
                                ${method.technique ? `<p><strong>Technique:</strong> ${method.technique}</p>` : ''}

                                ${method.steps ? `
                                    <div class="steps-list">
                                        ${method.steps.map(s => `<div class="step-item">${s}</div>`).join('')}
                                    </div>
                                ` : ''}

                                ${method.methods ? `
                                    <ul>
                                        ${method.methods.map(m => `<li>${m}</li>`).join('')}
                                    </ul>
                                ` : ''}

                                ${method.reality ? `<p><strong>Réalité:</strong> ${method.reality}</p>` : ''}
                                ${method.legal ? `<p><strong>Légal:</strong> ${method.legal}</p>` : ''}
                                ${method.modern ? `<p><strong>Moderne:</strong> ${method.modern}</p>` : ''}
                                ${method.risk ? `<div class="warning-box">${method.risk}</div>` : ''}
                                ${method.defense ? `<p><strong>Défense:</strong> ${method.defense}</p>` : ''}
                                ${method.legality ? `<div class="warning-box critical">${method.legality}</div>` : ''}
                            </div>
                        `).join('')}
                    ` : ''}

                    ${skill.motorcycles ? `
                        <div class="bikes-section">
                            <h4>Motos:</h4>
                            <ul>
                                ${skill.motorcycles.map(m => `<li>${m}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${skill.bicycles ? `
                        <div class="bikes-section">
                            <h4>Vélos:</h4>
                            <ul>
                                ${skill.bicycles.map(b => `<li>${b}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${skill.note ? `<div class="notes-box">${skill.note}</div>` : ''}
                </div>
            `).join('');
        }

        if (key === 'movement') {
            return category.tactics.map(tactic => `
                <div class="stat-card">
                    <h3>${tactic.title}</h3>

                    ${tactic.principles ? `
                        <div class="principles-list">
                            <strong>Principes:</strong>
                            <ul>
                                ${tactic.principles.map(p => `<li>${p}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${tactic.techniques ? `
                        ${tactic.techniques.map(tech => `
                            <div class="technique-section">
                                <h4>${tech.name}</h4>
                                <p>${tech.description}</p>
                                ${tech.method ? `<p><strong>Méthode:</strong> ${tech.method}</p>` : ''}
                                ${tech.tip ? `<p><strong>Astuce:</strong> ${tech.tip}</p>` : ''}

                                ${tech.tips ? `
                                    <ul>
                                        ${tech.tips.map(t => `<li>${t}</li>`).join('')}
                                    </ul>
                                ` : ''}
                            </div>
                        `).join('')}
                    ` : ''}

                    ${tactic.obstacles ? `
                        ${tactic.obstacles.map(obs => `
                            <div class="obstacle-section">
                                <h4>${obs.type}</h4>

                                ${obs.methods ? `
                                    <ul>
                                        ${obs.methods.map(m => `<li>${m}</li>`).join('')}
                                    </ul>
                                ` : ''}

                                ${obs.techniques ? `
                                    <ul>
                                        ${obs.techniques.map(t => `<li>${t}</li>`).join('')}
                                    </ul>
                                ` : ''}

                                ${obs.safety ? `
                                    <div class="safety-box">
                                        <strong>Sécurité:</strong>
                                        <ul>
                                            ${obs.safety.map(s => `<li>${s}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}

                                ${obs.detection ? `<div class="warning-box">${obs.detection}</div>` : ''}
                            </div>
                        `).join('')}
                    ` : ''}

                    ${tactic.skills ? `
                        <div class="skills-list">
                            <strong>Compétences:</strong>
                            <ul>
                                ${tactic.skills.map(s => `<li>${s}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${tactic.training ? `<div class="warning-box">${tactic.training}</div>` : ''}
                    ${tactic.survival ? `<div class="notes-box">${tactic.survival}</div>` : ''}
                </div>
            `).join('');
        }

        if (key === 'observation') {
            return category.skills.map(skill => `
                <div class="stat-card">
                    <h3>${skill.title}</h3>
                    ${skill.definition ? `<p><em>${skill.definition}</em></p>` : ''}

                    ${skill.techniques ? `
                        ${skill.techniques.map(tech => `
                            <div class="technique-section">
                                <h4>${tech.name}</h4>
                                <p>${tech.description}</p>

                                ${tech.elements ? `
                                    <ul>
                                        ${tech.elements.map(e => `<li>${e}</li>`).join('')}
                                    </ul>
                                ` : ''}

                                ${tech.indicators ? `
                                    <div class="indicators">
                                        <strong>Indicateurs:</strong>
                                        <ul>
                                            ${tech.indicators.map(i => `<li>${i}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}

                                ${tech.methods ? `
                                    <div class="methods">
                                        <strong>Méthodes:</strong>
                                        <ul>
                                            ${tech.methods.map(m => `<li>${m}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    ` : ''}

                    ${skill.objectives ? `
                        <div class="objectives">
                            <strong>Objectifs:</strong>
                            <ul>
                                ${skill.objectives.map(o => `<li>${o}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${skill.method ? `
                        <div class="method">
                            <strong>Méthode:</strong>
                            <ul>
                                ${skill.method.map(m => `<li>${m}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${skill.evasion ? `
                        <div class="evasion">
                            <strong>Évasion caméras:</strong>
                            <ul>
                                ${skill.evasion.map(e => `<li>${e}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${skill.reality ? `<div class="reality-box">${skill.reality}</div>` : ''}
                    ${skill.note ? `<div class="notes-box">${skill.note}</div>` : ''}
                </div>
            `).join('');
        }

        if (key === 'resources') {
            return category.urban.map(resource => `
                <div class="stat-card">
                    <h3>${resource.title}</h3>

                    ${resource.sources ? `
                        <div class="sources-list">
                            <strong>Sources:</strong>
                            <ul>
                                ${resource.sources.map(s => `<li>${s}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${resource.options ? `
                        <div class="options-list">
                            <strong>Options:</strong>
                            <ul>
                                ${resource.options.map(o => `<li>${o}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${resource.purification ? `
                        <div class="warning-box">${resource.purification}</div>
                    ` : ''}

                    ${resource.timing ? `<p><strong>Timing:</strong> ${resource.timing}</p>` : ''}

                    ${resource.safety ? `
                        <div class="safety-box">
                            <strong>Sécurité:</strong>
                            <ul>
                                ${resource.safety.map(s => `<li>${s}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `).join('');
        }

        return '<p>Contenu</p>';
    },

    selectCategory(category) {
        this.state.selectedCategory = category;
        this.saveState();
        app.loadModule('urban-survival');
    },

    saveState() {
        localStorage.setItem('urban_state', JSON.stringify(this.state));
    },

    loadState() {
        const saved = localStorage.getItem('urban_state');
        if (saved) {
            try {
                this.state = { ...this.state, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Failed to load urban state:', e);
            }
        }
    }
};

// Enregistrer le module
window.PipBoyModules = window.PipBoyModules || [];
window.PipBoyModules.push(UrbanSurvivalModule);
window.UrbanSurvivalModule = UrbanSurvivalModule;
