/**
 * Module LOCKPICKING - Crochetage, ouverture serrures
 * USAGE LÉGAL UNIQUEMENT - Vos propres serrures ou autorisation
 */

const LockpickingModule = {
    id: 'lockpicking',
    name: 'LOCKPICKING',
    icon: '🔓',

    state: {
        selectedSection: 'basics',
        practiceMode: false
    },

    sections: {
        basics: {
            name: 'BASES',
            content: {
                principe: {
                    title: 'Principe de Fonctionnement',
                    description: 'Serrure à goupilles standard (pin tumbler lock)',
                    parts: [
                        'Goupilles motrices (driver pins) - poussées par ressorts',
                        'Goupilles passives (key pins) - contact avec clé',
                        'Ligne de césure - doit s\'aligner avec cylindre',
                        'Cylindre (plug) - tourne quand goupilles alignées',
                        'Came (cam) - actionne le verrou'
                    ],
                    diagram: `
    Ressorts
       |||
    [===]  Driver pins
    [===]  Key pins
    =====  Ligne césure
     |||   Cylindre
                    `
                },
                outils: {
                    title: 'Outils Essentiels',
                    items: [
                        {
                            name: 'Crochet (Hook pick)',
                            use: 'Manipuler goupilles individuellement',
                            types: ['Standard', 'Short hook', 'Deep hook']
                        },
                        {
                            name: 'Râteau (Rake)',
                            use: 'Technique rapide, multiple goupilles',
                            types: ['Bogota', 'Snake', 'C-rake']
                        },
                        {
                            name: 'Entraîneur (Tension wrench)',
                            use: 'Appliquer tension rotative',
                            types: ['TOK (Top)', 'BOK (Bottom)'],
                            critical: true
                        },
                        {
                            name: 'Extracteur (Broken key extractor)',
                            use: 'Retirer clé cassée'
                        }
                    ]
                },
                improvisation: {
                    title: 'Outils Improvisés',
                    items: [
                        'Trombones - plier en L pour tension',
                        'Épingles à cheveux - crochet basique',
                        'Lames scie - râteau grossier',
                        'Cartes plastique - serrures à loquet',
                        'Fil métallique - outil flexible'
                    ],
                    warning: 'Moins efficace que outils pro, peut endommager serrure'
                }
            }
        },
        techniques: {
            name: 'TECHNIQUES',
            methods: [
                {
                    name: 'Single Pin Picking (SPP)',
                    difficulty: 'Intermédiaire',
                    description: 'Méthode précise, goupille par goupille',
                    steps: [
                        '1. Insérer entraîneur (tension légère)',
                        '2. Insérer crochet au fond de serrure',
                        '3. Localiser goupilles (retour arrière)',
                        '4. Identifier goupille liée (binding pin)',
                        '5. Soulever jusqu\'au clic subtil',
                        '6. Maintenir tension, passer à suivante',
                        '7. Répéter jusqu\'à ouverture'
                    ],
                    tips: [
                        'Tension = clé du succès (ni trop ni trop peu)',
                        'Écouter et sentir les retours',
                        'Goupille liée = celle qui résiste le plus',
                        'Si blocage: réduire tension, recommencer'
                    ],
                    time: '30s - 5min selon expérience'
                },
                {
                    name: 'Raking (Ratissage)',
                    difficulty: 'Débutant',
                    description: 'Technique rapide par vibration',
                    steps: [
                        '1. Tension modérée constante',
                        '2. Insérer râteau complètement',
                        '3. Mouvement va-et-vient rapide',
                        '4. Varier pression verticale',
                        '5. Tenter rotation pendant ratissage'
                    ],
                    tips: [
                        'Fonctionne sur serrures bas de gamme',
                        'Rapide mais moins fiable que SPP',
                        'Essayer 10-15s, sinon passer à SPP'
                    ],
                    time: '5-30 secondes'
                },
                {
                    name: 'Bumping',
                    difficulty: 'Facile',
                    description: 'Clé à percussion (bump key)',
                    requirements: [
                        'Clé vierge du bon profil',
                        'Limer toutes dents au minimum',
                        'Petit marteau ou tournevis'
                    ],
                    steps: [
                        '1. Insérer bump key (pas à fond)',
                        '2. Tension légère rotation',
                        '3. Percussion sèche sur clé',
                        '4. Simultané: tourner pendant impact'
                    ],
                    warning: 'Peut endommager serrure - traces évidentes',
                    defense: 'Serrures anti-bumping existent'
                },
                {
                    name: 'Bypass Techniques',
                    description: 'Contourner mécanisme sans crocheter',
                    methods: [
                        {
                            type: 'Carte plastique',
                            target: 'Loquets à ressort',
                            method: 'Glisser entre porte et cadre, pousser loquet'
                        },
                        {
                            type: 'Shim (cale)',
                            target: 'Cadenas à anse',
                            method: 'Insérer cale fine, désengager bille de retenue'
                        },
                        {
                            type: 'Impressioning',
                            target: 'Serrures à clé',
                            method: 'Marquer clé vierge, limer progressivement'
                        }
                    ]
                }
            ]
        },
        lockTypes: {
            name: 'TYPES SERRURES',
            locks: [
                {
                    type: 'Pin Tumbler',
                    difficulté: '★★☆☆☆',
                    description: 'Serrure la plus commune',
                    variants: [
                        'Standard - 5-6 goupilles',
                        'Haute sécurité - goupilles spéciales',
                        'Anti-bumping - goupilles à tête plate'
                    ],
                    vulnerable: 'SPP, Raking, Bumping'
                },
                {
                    type: 'Wafer Lock',
                    difficulté: '★☆☆☆☆',
                    description: 'Plaquettes au lieu de goupilles',
                    usages: 'Classeurs, meubles, voitures anciennes',
                    vulnerable: 'Très facile - raking efficace'
                },
                {
                    type: 'Tubular Lock',
                    difficulté: '★★★☆☆',
                    description: 'Goupilles disposées en cercle',
                    usages: 'Distributeurs, vélos, ordinateurs',
                    tools: 'Outil spécifique tubular ou improvisation',
                    vulnerable: 'Pick tubulaire dédié'
                },
                {
                    type: 'Disc Detainer',
                    difficulté: '★★★★☆',
                    description: 'Disques rotatifs au lieu de goupilles',
                    usages: 'Haute sécurité, coffres',
                    examples: 'Abloy, Abus',
                    notes: 'Très difficile - outils spécialisés requis'
                },
                {
                    type: 'Lever Lock',
                    difficulté: '★★★☆☆',
                    description: 'Leviers empilés',
                    usages: 'Serrures anciennes, coffres',
                    vulnerable: 'Crochetage possible mais technique'
                },
                {
                    type: 'Combination Lock',
                    difficulté: '★★☆☆☆',
                    description: 'Serrure à combinaison mécanique',
                    methods: [
                        'Écoute (stéthoscope)',
                        'Sensation de résistance',
                        'Défaut fabrication (Master Lock)'
                    ]
                }
            ]
        },
        legal: {
            name: 'LÉGALITÉ',
            warning: '⚖️ IMPORTANT - Aspects légaux',
            byCountry: [
                {
                    region: 'France',
                    possession: 'LÉGAL - Outils de crochetage autorisés',
                    usage: 'ILLÉGAL - Usage sans autorisation = effraction',
                    penalties: '3 ans prison + 45,000€ amende'
                },
                {
                    region: 'USA',
                    possession: 'Variable par État',
                    details: [
                        'États interdisant possession sans licence: MS, NV, OH, VA',
                        'Autres États: généralement légal si pas intention criminelle'
                    ],
                    usage: 'Fédéral: 10 ans prison si usage criminel'
                },
                {
                    region: 'UK',
                    possession: 'ILLÉGAL en public sans raison légitime',
                    usage: 'Criminal Law Act 1977 - Going equipped for theft'
                },
                {
                    region: 'Canada',
                    possession: 'LÉGAL si serrurier ou usage légitime',
                    usage: 'Section 351 Criminal Code - Possession d\'outils'
                }
            ],
            legitimateUse: [
                '✅ Entraînement sur vos propres serrures',
                '✅ Sport (compétitions lockpicking)',
                '✅ Profession de serrurier',
                '✅ Urgence sur votre propriété',
                '❌ JAMAIS sur propriété d\'autrui sans autorisation'
            ],
            disclaimer: 'Information éducative uniquement. L\'auteur et le distributeur déclinent toute responsabilité pour usage illégal.'
        },
        practice: {
            name: 'ENTRAÎNEMENT',
            exercises: [
                {
                    level: 'Débutant',
                    locks: [
                        'Master Lock n°3 - Très facile',
                        'Serrures transparentes - Voir mécanisme',
                        'Cadenas de base - Premier succès'
                    ],
                    focus: 'Sensation de feedback, tension correcte'
                },
                {
                    level: 'Intermédiaire',
                    locks: [
                        'Serrures 5-6 goupilles standard',
                        'Serrures avec goupilles sécurité (serrated)',
                        'Différents profils de clés'
                    ],
                    focus: 'SPP précis, reconnaissance goupilles'
                },
                {
                    level: 'Avancé',
                    locks: [
                        'Serrures haute sécurité (Medeco, Mul-T-Lock)',
                        'Goupilles spécialisées (spool, mushroom)',
                        'Serrures à disques'
                    ],
                    focus: 'Contre-rotation, feedback subtil'
                }
            ],
            skills: {
                title: 'Compétences à Développer',
                list: [
                    'Sensibilité tactile (légèreté du toucher)',
                    'Écoute active (clics, frottements)',
                    'Patience et persistance',
                    'Visualisation mentale du mécanisme',
                    'Gestion de la tension (tension wrench)',
                    'Diagnostics (identifier blocages)'
                ]
            }
        }
    },

    async init() {
        console.log('[Lockpicking] Module initialized');
        this.loadState();
    },

    render() {
        const section = this.sections[this.state.selectedSection];

        return `
            <div class="module lockpicking-module">
                <div class="module-header">
                    <h2 class="module-title">${this.icon} ${this.name}</h2>
                    <div class="warning-badge medium">
                        ⚖️ USAGE LÉGAL UNIQUEMENT
                    </div>
                </div>

                <div class="disclaimer warning">
                    <strong>⚠️ AVERTISSEMENT LÉGAL</strong>
                    <p><strong>Usage sur vos propres serrures ou avec autorisation UNIQUEMENT.</strong></p>
                    <p>Usage sans autorisation = DÉLIT D'EFFRACTION dans la plupart des pays.</p>
                    <p>Cette information est à but éducatif et d'urgence survie.</p>
                </div>

                <div class="lockpicking-nav">
                    ${Object.keys(this.sections).map(key => `
                        <button class="nav-btn ${key === this.state.selectedSection ? 'active' : ''}"
                                onclick="LockpickingModule.selectSection('${key}')">
                            ${this.sections[key].name}
                        </button>
                    `).join('')}
                </div>

                <div class="lockpicking-content">
                    ${this.renderSection(section)}
                </div>
            </div>
        `;
    },

    renderSection(section) {
        const key = this.state.selectedSection;

        if (key === 'basics') {
            return `
                ${Object.values(section.content).map(item => `
                    <div class="stat-card">
                        <h3>${item.title}</h3>
                        ${item.description ? `<p><strong>${item.description}</strong></p>` : ''}

                        ${item.parts ? `
                            <ul>
                                ${item.parts.map(p => `<li>${p}</li>`).join('')}
                            </ul>
                        ` : ''}

                        ${item.diagram ? `
                            <pre class="diagram">${item.diagram}</pre>
                        ` : ''}

                        ${item.items ? `
                            <div class="tools-grid">
                                ${item.items.map(tool => `
                                    <div class="tool-card ${tool.critical ? 'critical' : ''}">
                                        <h4>${tool.name}</h4>
                                        <p>${tool.use}</p>
                                        ${tool.types ? `
                                            <div class="types">
                                                Types: ${tool.types.join(', ')}
                                            </div>
                                        ` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}

                        ${item.warning ? `
                            <div class="warning-box">${item.warning}</div>
                        ` : ''}
                    </div>
                `).join('')}
            `;
        }

        if (key === 'techniques') {
            return section.methods.map(method => `
                <div class="stat-card technique-card">
                    <h3>${method.name}</h3>
                    <div class="difficulty">Difficulté: ${method.difficulty}</div>
                    <p>${method.description}</p>

                    ${method.requirements ? `
                        <div class="requirements">
                            <strong>Requis:</strong>
                            <ul>
                                ${method.requirements.map(r => `<li>${r}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${method.steps ? `
                        <div class="steps-list">
                            <strong>ÉTAPES:</strong>
                            ${method.steps.map(step => `
                                <div class="step-item">${step}</div>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${method.methods ? `
                        <div class="methods-list">
                            ${method.methods.map(m => `
                                <div class="method-item">
                                    <strong>${m.type}</strong> - ${m.target}<br>
                                    <span style="opacity: 0.8">${m.method}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${method.tips ? `
                        <div class="tips-box">
                            <strong>💡 CONSEILS:</strong>
                            <ul>
                                ${method.tips.map(tip => `<li>${tip}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${method.time ? `<div class="time-estimate">⏱️ Temps: ${method.time}</div>` : ''}
                    ${method.warning ? `<div class="warning-box">${method.warning}</div>` : ''}
                </div>
            `).join('');
        }

        if (key === 'lockTypes') {
            return section.locks.map(lock => `
                <div class="stat-card lock-card">
                    <h3>${lock.type}</h3>
                    <div class="difficulty">Difficulté: ${lock.difficulté}</div>
                    <p>${lock.description}</p>

                    ${lock.usages ? `<p><strong>Usages:</strong> ${lock.usages}</p>` : ''}
                    ${lock.examples ? `<p><strong>Exemples:</strong> ${lock.examples}</p>` : ''}

                    ${lock.variants ? `
                        <div class="variants">
                            <strong>Variantes:</strong>
                            <ul>
                                ${lock.variants.map(v => `<li>${v}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${lock.methods ? `
                        <div class="methods">
                            ${lock.methods.map(m => `<div>• ${m}</div>`).join('')}
                        </div>
                    ` : ''}

                    <div class="vulnerable-box">
                        <strong>Vulnérabilités:</strong> ${lock.vulnerable}
                    </div>

                    ${lock.notes ? `<div class="notes-box">${lock.notes}</div>` : ''}
                </div>
            `).join('');
        }

        if (key === 'legal') {
            return `
                <div class="stat-card legal-warning">
                    <h3>${section.warning}</h3>

                    ${section.byCountry.map(country => `
                        <div class="country-legal">
                            <h4>${country.region}</h4>
                            <div class="legal-item">
                                <strong>Possession:</strong> ${country.possession}
                            </div>
                            <div class="legal-item">
                                <strong>Usage:</strong> ${country.usage}
                            </div>
                            ${country.details ? `
                                <ul>
                                    ${country.details.map(d => `<li>${d}</li>`).join('')}
                                </ul>
                            ` : ''}
                            ${country.penalties ? `
                                <div class="penalties">Peines: ${country.penalties}</div>
                            ` : ''}
                        </div>
                    `).join('')}

                    <div class="legitimate-use">
                        <h4>Usage Légitime:</h4>
                        ${section.legitimateUse.map(use => `
                            <div class="use-item">${use}</div>
                        `).join('')}
                    </div>

                    <div class="disclaimer-box critical">
                        ${section.disclaimer}
                    </div>
                </div>
            `;
        }

        if (key === 'practice') {
            return `
                <div class="stat-card">
                    <h3>Progression d'Entraînement</h3>
                    ${section.exercises.map(ex => `
                        <div class="level-section">
                            <h4>${ex.level}</h4>
                            <div class="locks-list">
                                <strong>Serrures recommandées:</strong>
                                <ul>
                                    ${ex.locks.map(l => `<li>${l}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="focus">
                                <strong>Focus:</strong> ${ex.focus}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="stat-card">
                    <h3>${section.skills.title}</h3>
                    <ul>
                        ${section.skills.list.map(skill => `
                            <li>${skill}</li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        return '<p>Section content</p>';
    },

    selectSection(section) {
        this.state.selectedSection = section;
        this.saveState();
        app.loadModule('lockpicking');
    },

    saveState() {
        localStorage.setItem('lockpicking_state', JSON.stringify(this.state));
    },

    loadState() {
        const saved = localStorage.getItem('lockpicking_state');
        if (saved) {
            try {
                this.state = { ...this.state, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Failed to load lockpicking state:', e);
            }
        }
    }
};

// Enregistrer le module
window.PipBoyModules = window.PipBoyModules || [];
window.PipBoyModules.push(LockpickingModule);
window.LockpickingModule = LockpickingModule;
