/**
 * Module CHIMIE - Synthèses, réactions, formules
 * USAGE ÉDUCATIF ET SITUATION D'URGENCE UNIQUEMENT
 */

const ChemistryModule = {
    id: 'chemistry',
    name: 'CHEMISTRY',
    icon: '⚗️',

    state: {
        selectedCategory: 'basics',
        searchQuery: '',
        favorites: []
    },

    categories: {
        basics: {
            name: 'BASES',
            items: [
                {
                    title: 'Acides et Bases',
                    formulas: [
                        'HCl - Acide chlorhydrique (nettoyage, gravure)',
                        'H2SO4 - Acide sulfurique (batterie, synthèse)',
                        'HNO3 - Acide nitrique (explosifs, gravure)',
                        'NaOH - Hydroxyde de sodium (savon, nettoyage)',
                        'NH3 - Ammoniaque (nettoyage, engrais)'
                    ],
                    danger: 'EXTREME - Brûlures chimiques',
                    safety: 'Gants nitrile, lunettes, ventilation'
                },
                {
                    title: 'Solvants Usuels',
                    formulas: [
                        'C2H5OH - Éthanol (désinfection, extraction)',
                        'CH3COCH3 - Acétone (nettoyage, dissolution)',
                        'C6H6 - Benzène (solvant, synthèse)',
                        'CH2Cl2 - Dichlorométhane (extraction)',
                        'C7H8 - Toluène (solvant non-polaire)'
                    ],
                    danger: 'MOYEN - Inflammable, toxique',
                    safety: 'Loin des flammes, ventilation'
                }
            ]
        },
        explosives: {
            name: 'ÉNERGÉTIQUES',
            items: [
                {
                    title: 'Oxydants',
                    formulas: [
                        'KNO3 - Nitrate de potassium (poudre noire, engrais)',
                        'KClO3 - Chlorate de potassium (allumettes, pyrotechnie)',
                        'NH4NO3 - Nitrate d\'ammonium (engrais, ANFO)',
                        'H2O2 - Peroxyde d\'hydrogène (désinfection, propulsion)',
                        'KMnO4 - Permanganate de potassium (allumage friction)'
                    ],
                    danger: 'EXTREME - Explosif au contact',
                    safety: 'Isoler des combustibles, conteneurs propres'
                },
                {
                    title: 'Poudre Noire (Historique)',
                    formula: '75% KNO3 + 15% C + 10% S',
                    steps: [
                        '1. Broyer séparément chaque composant',
                        '2. Mélanger progressivement (cuillère bois)',
                        '3. Humidifier légèrement (alcool)',
                        '4. Presser et granuler',
                        '5. Sécher lentement à l\'air'
                    ],
                    danger: 'EXTREME - Sensible friction/étincelle',
                    notes: 'Composition historique - Document éducatif'
                },
                {
                    title: 'ANFO (Agriculture)',
                    formula: '94% NH4NO3 + 6% fuel oil',
                    application: 'Défrichage, carrières (usage civil réglementé)',
                    danger: 'EXTREME - Explosif puissant',
                    notes: 'Nécessite détonateur - Usage professionnel'
                }
            ]
        },
        pyrotechnics: {
            name: 'PYROTECHNIE',
            items: [
                {
                    title: 'Thermite',
                    formula: 'Fe2O3 (rouille) + Al (poudre)',
                    ratio: '3:1 en masse',
                    ignition: 'Magnésium ou KMnO4 + Glycérine',
                    temp: '~2500°C',
                    uses: 'Soudure, découpe métal',
                    danger: 'EXTREME - Brûlure thermique intense',
                    safety: 'Surface incombustible, distances sécurité'
                },
                {
                    title: 'Fumigènes Colorés',
                    formulas: [
                        'KNO3 + Sucre (fumée blanche)',
                        '+ Colorant (orange/vert/bleu)',
                        'Ratio: 60% KNO3, 40% sucre'
                    ],
                    method: 'Chauffer doucement en mélangeant, mouler',
                    danger: 'MOYEN - Combustion vive',
                    uses: 'Signalisation, camouflage'
                }
            ]
        },
        synthesis: {
            name: 'SYNTHÈSES',
            items: [
                {
                    title: 'Savon (Saponification)',
                    formula: 'Graisse + NaOH → Savon + Glycérine',
                    steps: [
                        '1. Dissoudre NaOH dans eau (25%)',
                        '2. Chauffer graisse/huile (60°C)',
                        '3. Ajouter lye progressivement',
                        '4. Mélanger 20-30 min (trace)',
                        '5. Mouler et durcir 4-6 semaines'
                    ],
                    danger: 'MOYEN - Base corrosive',
                    uses: 'Hygiène, nettoyage'
                },
                {
                    title: 'Éthanol (Distillation)',
                    source: 'Fermentation sucres (levure)',
                    process: 'Distillation fractionnée 78.4°C',
                    purity: 'Max 95% (azéotrope eau)',
                    steps: [
                        '1. Fermentation 7-14 jours',
                        '2. Distiller lentement',
                        '3. Rejeter 10% premiers (méthanol)',
                        '4. Collecter fraction principale',
                        '5. Stocker hermétiquement'
                    ],
                    danger: 'MOYEN - Inflammable, méthanol toxique',
                    uses: 'Désinfection, carburant, solvant'
                },
                {
                    title: 'Acide Acétique (Vinaigre Fort)',
                    method: 'Fermentation acétique éthanol',
                    bacteria: 'Acetobacter (mère de vinaigre)',
                    concentration: '4-8% (alimentaire) à 30% (industriel)',
                    uses: 'Conservation, nettoyage, désinfection'
                }
            ]
        },
        extraction: {
            name: 'EXTRACTIONS',
            items: [
                {
                    title: 'Huiles Essentielles',
                    methods: [
                        'Distillation vapeur (lavande, menthe)',
                        'Expression à froid (agrumes)',
                        'Extraction solvant (résines)'
                    ],
                    equipment: 'Alambic ou distillateur improvise',
                    uses: 'Médecine, répulsif, carburant'
                },
                {
                    title: 'Charbon Actif',
                    source: 'Bois dur, coques noix de coco',
                    process: [
                        '1. Carboniser à haute température',
                        '2. Activer vapeur/CO2 800-900°C',
                        '3. Laver et sécher',
                        '4. Broyer finement'
                    ],
                    uses: 'Filtration eau, purification air, médecine'
                },
                {
                    title: 'Salpêtre (KNO3)',
                    sources: [
                        'Guano (excréments oiseaux/chauves-souris)',
                        'Compost vieilli (nitrification)',
                        'Urine + cendres de bois'
                    ],
                    extraction: [
                        '1. Lixiviation à l\'eau chaude',
                        '2. Filtration',
                        '3. Évaporation lente',
                        '4. Cristallisation KNO3',
                        '5. Purification recristallisation'
                    ],
                    uses: 'Conservation viande, poudre noire, engrais'
                }
            ]
        }
    },

    async init() {
        console.log('[Chemistry] Module initialized');
        this.loadState();
    },

    render() {
        const category = this.categories[this.state.selectedCategory];

        return `
            <div class="module chemistry-module">
                <div class="module-header">
                    <h2 class="module-title">${this.icon} ${this.name}</h2>
                    <div class="warning-badge extreme">
                        ⚠️ DANGEREUX
                    </div>
                </div>

                <div class="disclaimer critical">
                    <strong>⚠️ AVERTISSEMENT CRITIQUE</strong>
                    <p>Ces informations sont pour ÉDUCATION et URGENCE SURVIE uniquement.</p>
                    <p>Manipulation de produits chimiques = RISQUE MORTEL.</p>
                    <p>Vérifier législation locale. Usage responsable OBLIGATOIRE.</p>
                </div>

                <div class="chemistry-nav">
                    ${Object.keys(this.categories).map(key => `
                        <button class="nav-btn ${key === this.state.selectedCategory ? 'active' : ''}"
                                onclick="ChemistryModule.selectCategory('${key}')">
                            ${this.categories[key].name}
                        </button>
                    `).join('')}
                </div>

                <div class="chemistry-content">
                    <h3 class="category-title">${category.name}</h3>

                    ${category.items.map((item, idx) => `
                        <div class="stat-card chemistry-item">
                            <div class="item-header">
                                <h4>${item.title}</h4>
                                ${item.danger ? `
                                    <span class="danger-level ${item.danger.split('-')[0].trim().toLowerCase()}">
                                        ${item.danger}
                                    </span>
                                ` : ''}
                            </div>

                            ${item.formula ? `
                                <div class="formula-box">
                                    <strong>FORMULE:</strong>
                                    <code>${item.formula}</code>
                                </div>
                            ` : ''}

                            ${item.formulas ? `
                                <div class="formulas-list">
                                    ${item.formulas.map(f => `
                                        <div class="formula-item"><code>${f}</code></div>
                                    `).join('')}
                                </div>
                            ` : ''}

                            ${item.ratio ? `<p><strong>Ratio:</strong> ${item.ratio}</p>` : ''}
                            ${item.temp ? `<p><strong>Température:</strong> ${item.temp}</p>` : ''}
                            ${item.ignition ? `<p><strong>Allumage:</strong> ${item.ignition}</p>` : ''}

                            ${item.steps ? `
                                <div class="steps-list">
                                    <strong>PROCÉDURE:</strong>
                                    ${item.steps.map(step => `
                                        <div class="step-item">${step}</div>
                                    `).join('')}
                                </div>
                            ` : ''}

                            ${item.methods ? `
                                <div class="methods-list">
                                    <strong>MÉTHODES:</strong>
                                    ${item.methods.map(m => `<div>• ${m}</div>`).join('')}
                                </div>
                            ` : ''}

                            ${item.safety ? `
                                <div class="safety-box">
                                    <strong>🛡️ SÉCURITÉ:</strong> ${item.safety}
                                </div>
                            ` : ''}

                            ${item.uses ? `
                                <div class="uses-box">
                                    <strong>USAGES:</strong> ${item.uses}
                                </div>
                            ` : ''}

                            ${item.notes ? `
                                <div class="notes-box">
                                    <strong>NOTES:</strong> ${item.notes}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>

                <div class="chemistry-footer">
                    <p style="opacity: 0.7; font-size: 14px;">
                        📚 Sources: Army TM, Anarchist Cookbook, Chemistry texts<br>
                        ⚖️ Vérifiez la légalité dans votre juridiction
                    </p>
                </div>
            </div>
        `;
    },

    selectCategory(category) {
        this.state.selectedCategory = category;
        this.saveState();
        app.loadModule('chemistry');
    },

    async onActivate() {
        console.log('[Chemistry] Module activated');
    },

    saveState() {
        localStorage.setItem('chemistry_state', JSON.stringify(this.state));
    },

    loadState() {
        const saved = localStorage.getItem('chemistry_state');
        if (saved) {
            try {
                this.state = { ...this.state, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Failed to load chemistry state:', e);
            }
        }
    }
};

// Enregistrer le module
window.PipBoyModules = window.PipBoyModules || [];
window.PipBoyModules.push(ChemistryModule);
window.ChemistryModule = ChemistryModule;
