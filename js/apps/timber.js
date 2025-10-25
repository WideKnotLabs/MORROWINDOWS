// Timber - Mystical Matchmaking Game
class TimberApp {
    constructor(windowId) {
        this.windowId = windowId;
        this.profiles = [];
        this.currentProfileIndex = 0;
        this.matches = [];
        this.reputation = 0;
        this.highScore = parseInt(localStorage.getItem('timber_high_score') || '0');
        this.selectedIngredients = [];
        this.gameState = 'start'; // 'start', 'profile', 'minigame', 'result', 'end'

        // Economy system
        this.gold = 10; // Starting gold per profile
        this.baseGold = 10; // Base gold provided by each profile
        this.nextProfileGold = 10; // Gold for the next profile
        this.passes = 5; // Starting passes per game

        // Game constants
        this.EFFECT_WEIGHT = 2;
        this.INGREDIENT_COSTS = { "Common": 1, "Uncommon": 2, "Rare": 3 };
        this.REROLL_COST = 1;

        // Reputation rewards by outcome
        this.REPUTATION_REWARDS = {
            "Critical Match": 6,
            "Match": 4,
            "Like": 2,
            "Awkward": 1,
            "No Match": 0
        };

        // Gold rewards by outcome
        this.GOLD_REWARDS = {
            "Critical Match": 5,
            "Match": 3,
            "Like": 2,
            "Awkward": 1,
            "No Match": 0
        };

        // Rarity-based scoring modifiers
        this.RARITY_MODIFIERS = {
            "Common": { match: 2, miss: -1 },
            "Uncommon": { match: 2, miss: -1 },
            "Rare": { match: 5, miss: -3 }
        };

        this.init();
    }

    init() {
        this.initializeIngredients();
        this.loadProfiles();
        this.render();
        this.setupEventListeners();
    }

    initializeIngredients() {
        // Enhanced ingredient database with clear properties
        this.ingredientDatabase = [
            { id: "kresh_weed", name: "Kresh Weed", aspects: ["Earth"], effects: ["Calm"], rarity: "Common" },
            { id: "fire_petal", name: "Fire Petal", aspects: ["Fire"], effects: ["Charm"], rarity: "Uncommon" },
            { id: "heather", name: "Heather", aspects: ["Air"], effects: ["Grace"], rarity: "Common" },
            { id: "trama_root", name: "Trama Root", aspects: ["Earth"], effects: ["Sturdy"], rarity: "Common" },
            { id: "saltrice", name: "Saltrice", aspects: ["Water"], effects: ["Calm"], rarity: "Common" },
            { id: "scrap_metal", name: "Scrap Metal", aspects: ["Earth"], effects: ["Bold"], rarity: "Common" },
            { id: "kwama_cuttle", name: "Kwama Cuttle", aspects: ["Water"], effects: ["Calm"], rarity: "Common" },
            { id: "resin", name: "Resin", aspects: ["Earth"], effects: ["Sturdy"], rarity: "Common" },
            { id: "stoneflower", name: "Stoneflower", aspects: ["Earth"], effects: ["Grace"], rarity: "Common" },
            { id: "ectoplasm", name: "Ectoplasm", aspects: ["Spirit"], effects: ["Mystery"], rarity: "Uncommon" },
            { id: "vampire_dust", name: "Vampire Dust", aspects: ["Shadow"], effects: ["Mystery"], rarity: "Uncommon" },
            { id: "ruby", name: "Ruby", aspects: ["Fire"], effects: ["Charm"], rarity: "Uncommon" },
            { id: "moon_sugar", name: "Moon Sugar", aspects: ["Light"], effects: ["Grace"], rarity: "Uncommon" },
            { id: "diamond", name: "Diamond", aspects: ["Light"], effects: ["Grace"], rarity: "Rare" },
            { id: "soul_gem", name: "Soul Gem", aspects: ["Spirit"], effects: ["Mystery"], rarity: "Rare" }
        ];

        // Ingredient synergies (combinations that create bonus effects)
        this.synergies = [
            { ingredients: ["ruby", "fire_petal"], name: "Passionate Brew", bonus: 3 },
            { ingredients: ["moon_sugar", "diamond"], name: "Radiant Elixir", bonus: 3 },
            { ingredients: ["ectoplasm", "soul_gem"], name: "Spirit Bond", bonus: 4 },
            { ingredients: ["vampire_dust", "shadow_aspect"], name: "Dark Allure", bonus: 3 },
            { ingredients: ["earth_aspect", "earth_aspect"], name: "Grounded Foundation", bonus: 2 },
            { ingredients: ["water_aspect", "water_aspect"], name: "Tranquil Harmony", bonus: 2 }
        ];

        // Ingredient contradictions (anti-synergies)
        this.contradictions = [
            { ingredients: ["fire_petal", "kwama_cuttle"], effect: "both_cancel" },
            { ingredients: ["diamond", "scrap_metal"], effect: "both_cancel" },
            { ingredients: ["ectoplasm", "saltrice"], effect: "both_cancel" }
        ];
    }

    loadProfiles() {
        // Enhanced profile generation with difficulty levels
        const names = [
            "Aeliana Moonwhisper", "Theron Shadowbane", "Lyra Starweaver", "Kaelen Stormrider",
            "Seraphina Nightbloom", "Zephyr Windwalker", "Elara Sunfire", "Raven Darkthorn",
            "Orion Silverleaf", "Luna Mistwalker", "Phoenix Emberheart", "Atlas Stoneforge"
        ];

        const elements = ["Fire", "Water", "Earth", "Air", "Spirit", "Shadow", "Light"];
        const classes = ["Mage", "Warrior", "Rogue", "Cleric", "Ranger", "Paladin", "Druid"];

        // Create profiles with varying difficulty levels
        const difficultyDistribution = [
            { count: 3, minCompat: 90, maxCompat: 100 }, // Easy matches
            { count: 4, minCompat: 75, maxCompat: 89 },  // Medium matches
            { count: 5, minCompat: 50, maxCompat: 74 }   // Hard matches
        ];

        let profileIndex = 0;
        difficultyDistribution.forEach(difficulty => {
            for (let i = 0; i < difficulty.count; i++) {
                const element = elements[Math.floor(Math.random() * elements.length)];
                const cls = classes[Math.floor(Math.random() * classes.length)];
                const compatibility = Math.floor(Math.random() * (difficulty.maxCompat - difficulty.minCompat + 1)) + difficulty.minCompat;

                this.profiles.push({
                    id: profileIndex++,
                    name: names[profileIndex % names.length],
                    age: Math.floor(Math.random() * 200) + 100,
                    element: element,
                    class: cls,
                    bio: this.generateBio(names[profileIndex % names.length], element, cls),
                    compatibility: compatibility,
                    hint: this.generateHint(element, cls),
                    difficulty: this.getDifficultyLevel(compatibility)
                });
            }
        });

        // Shuffle profiles
        this.profiles.sort(() => Math.random() - 0.5);
    }

    getDifficultyLevel(compatibility) {
        if (compatibility >= 90) return "Easy";
        if (compatibility >= 75) return "Medium";
        return "Hard";
    }

    generateHint(element, cls) {
        const elementHints = {
            "Fire": "seeks warmth and passion",
            "Water": "values calm and tranquility",
            "Earth": "appreciates stability and strength",
            "Air": "loves freedom and movement",
            "Spirit": "values mystical experiences",
            "Shadow": "drawn to mystery and intrigue",
            "Light": "seeks clarity and truth"
        };

        const classHints = {
            "Mage": "practices magical arts",
            "Warrior": "values strength and honor",
            "Rogue": "values cleverness and wit",
            "Cleric": "values faith and devotion",
            "Ranger": "loves nature and wilderness",
            "Paladin": "values honor and justice",
            "Druid": "deeply connected to nature"
        };

        return `${elementHints[element]} and ${classHints[cls]}.`;
    }

    generateBio(name, element, cls) {
        const bios = [
            `Seeking a fellow adventurer to explore the ${element.toLowerCase()} realms with!`,
            `Learned ${cls.toLowerCase()} seeking intellectual connection and deep conversation.`,
            `Romantic at heart, seeking a soulmate under the ${element.toLowerCase()} moon.`,
            `Practical ${cls.toLowerCase()} seeking a stable, meaningful relationship.`,
            `There's more to me than meets the eye... care to discover my secrets?`
        ];

        return bios[Math.floor(Math.random() * bios.length)];
    }

    deriveAffinities(profile) {
        const base = {
            Fire: ["Fire", "Charm"],
            Water: ["Water", "Calm"],
            Earth: ["Earth", "Sturdy"],
            Air: ["Air", "Grace"],
            Shadow: ["Shadow", "Mystery"],
            Light: ["Light", "Grace"],
            Spirit: ["Spirit", "Mystery"]
        };

        const byClass = {
            Mage: ["Mystery", "Grace"],
            Warrior: ["Sturdy", "Bold"],
            Rogue: ["Mystery", "Bold"],
            Cleric: ["Grace", "Calm"],
            Ranger: ["Sturdy", "Calm"],
            Paladin: ["Grace", "Sturdy"],
            Druid: ["Mystery", "Calm"]
        };

        const likes = new Set([
            ...(base[profile.element] || []),
            ...(byClass[profile.class] || [])
        ]);

        return { likes };
    }

    scorePotion(selected, profile) {
        const affinities = this.deriveAffinities(profile);
        let total = 0;
        const details = { ingredients: [], bonuses: [], penalties: [], synergies: [], contradictions: [] };

        // Check for contradictions first (they cancel ingredients)
        const canceledIngredients = new Set();
        for (const contradiction of this.contradictions) {
            const hasIngredients = contradiction.ingredients.every(ingId =>
                selected.some(ing => ing.id === ingId)
            );

            if (hasIngredients) {
                contradiction.ingredients.forEach(ingId => canceledIngredients.add(ingId));
                details.contradictions.push({
                    name: `${contradiction.ingredients.join(" + ")} canceled`,
                    effect: "Both ingredients become worthless"
                });
            }
        }

        // Score each ingredient
        for (const ing of selected) {
            if (canceledIngredients.has(ing.id)) {
                // Canceled ingredients contribute 0 points
                details.ingredients.push({
                    name: ing.name,
                    hits: [],
                    penalties: ["Canceled by contradiction"],
                    score: 0
                });
                continue;
            }

            let ingredientScore = 0;
            const ingredientDetails = { name: ing.name, hits: [], penalties: [], score: 0 };
            const rarityMod = this.RARITY_MODIFIERS[ing.rarity];

            // Score aspects with rarity modifiers
            for (const aspect of ing.aspects) {
                if (affinities.likes.has(aspect)) {
                    ingredientScore += rarityMod.match;
                    ingredientDetails.hits.push(`+${aspect} (+${rarityMod.match})`);
                } else {
                    ingredientScore += rarityMod.miss;
                    ingredientDetails.penalties.push(`-${aspect} (${rarityMod.miss})`);
                }
            }

            // Score effects with higher weight and rarity modifiers
            for (const effect of ing.effects || []) {
                if (affinities.likes.has(effect)) {
                    const effectScore = this.EFFECT_WEIGHT;
                    ingredientScore += effectScore;
                    ingredientDetails.hits.push(`+${effect} (+${effectScore})`);
                } else {
                    ingredientScore += rarityMod.miss;
                    ingredientDetails.penalties.push(`-${effect} (${rarityMod.miss})`);
                }
            }

            ingredientDetails.score = ingredientScore;
            total += ingredientScore;
            details.ingredients.push(ingredientDetails);
        }

        // Check for synergies
        for (const synergy of this.synergies) {
            let hasSynergy = false;

            if (synergy.ingredients.includes("earth_aspect")) {
                // Special case: any 2 earth ingredients
                const earthIngredients = selected.filter(ing =>
                    ing.aspects.includes("Earth") && !canceledIngredients.has(ing.id)
                );
                if (earthIngredients.length >= 2) {
                    hasSynergy = true;
                }
            } else if (synergy.ingredients.includes("water_aspect")) {
                // Special case: any 2 water ingredients
                const waterIngredients = selected.filter(ing =>
                    ing.aspects.includes("Water") && !canceledIngredients.has(ing.id)
                );
                if (waterIngredients.length >= 2) {
                    hasSynergy = true;
                }
            } else if (synergy.ingredients.includes("shadow_aspect")) {
                // Special case: vampire dust + any shadow aspect ingredient
                const hasVampireDust = selected.some(ing => ing.id === "vampire_dust" && !canceledIngredients.has(ing.id));
                const hasShadowAspect = selected.some(ing =>
                    ing.aspects.includes("Shadow") && !canceledIngredients.has(ing.id)
                );
                if (hasVampireDust && hasShadowAspect) {
                    hasSynergy = true;
                }
            } else {
                // Regular synergy: specific ingredients
                hasSynergy = synergy.ingredients.every(ingId =>
                    selected.some(ing => ing.id === ingId && !canceledIngredients.has(ing.id))
                );
            }

            if (hasSynergy) {
                total += synergy.bonus;
                details.synergies.push({
                    name: synergy.name,
                    bonus: synergy.bonus
                });
            }
        }

        // Determine outcome
        let outcome = "No Match";
        if (total >= 10) outcome = "Critical Match";
        else if (total >= 7) outcome = "Match";
        else if (total >= 4) outcome = "Like";
        else if (total >= 2) outcome = "Awkward";

        return { total, outcome, details };
    }

    render() {
        const contentElement = document.getElementById(`${this.windowId}-content`);
        if (!contentElement) return;

        if (this.gameState === 'start') {
            this.renderStartScreen(contentElement);
        } else if (this.gameState === 'profile') {
            this.renderProfileView(contentElement);
        } else if (this.gameState === 'minigame') {
            // Minigame view is handled by renderPotionMinigame
        } else if (this.gameState === 'result') {
            // Result view is handled by checkPotion
        } else if (this.gameState === 'end') {
            this.renderEndScreen(contentElement);
        }
    }

    renderStartScreen(contentElement) {
        contentElement.innerHTML = `
            <div class="timber-content">
                <div class="timber-header">
                    <div class="timber-logo timber-icon"></div>
                    <div class="timber-title">Timber</div>
                </div>
                
                <div class="timber-main">
                    <div class="timber-start-screen">
                        <div class="timber-start-content">
                            <h2>Welcome to Timber</h2>
                            <p class="timber-start-description">
                                As a mystical matchmaker, you'll brew potions to attract potential partners.
                                Each profile has unique preferences - choose your ingredients wisely!
                            </p>
                            
                            <div class="timber-start-rules">
                                <h3>How to Play:</h3>
                                <ul>
                                    <li>View profiles with compatibility ratings (50-100%)</li>
                                    <li>Brew potions with 3 ingredients or use a Pass</li>
                                    <li>Each profile gives you 10 gold coins to spend</li>
                                    <li>Ingredient costs: Common (1g), Uncommon (2g), Rare (3g)</li>
                                    <li>Pay 1 gold to reroll ingredients if needed</li>
                                    <li>Earn reputation and gold rewards for successful matches</li>
                                    <li>Watch out for ingredient synergies and contradictions!</li>
                                </ul>
                            </div>
                            
                            <div class="timber-start-highscore">
                                <div class="timber-highscore-label">High Score</div>
                                <div class="timber-highscore-value">${this.highScore} Reputation</div>
                            </div>
                            
                            <button class="btn btn-primary timber-start-btn" id="start-game-btn">
                                Begin Matchmaking
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('start-game-btn').addEventListener('click', () => {
            this.startNewGame();
        });
    }

    renderEndScreen(contentElement) {
        const rank = this.getRankTitle(this.reputation);
        const isNewHighScore = this.reputation > this.highScore;

        contentElement.innerHTML = `
            <div class="timber-content">
                <div class="timber-header">
                    <div class="timber-logo timber-icon"></div>
                    <div class="timber-title">Timber</div>
                </div>
                
                <div class="timber-main">
                    <div class="timber-end-screen">
                        <div class="timber-end-content">
                            <h2>Matchmaking Complete!</h2>
                            
                            <div class="timber-final-stats">
                                <div class="timber-final-reputation">
                                    <div class="timber-stat-label">Final Reputation</div>
                                    <div class="timber-stat-value">${this.reputation}</div>
                                </div>
                                
                                <div class="timber-final-rank">
                                    <div class="timber-stat-label">Your Rank</div>
                                    <div class="timber-stat-value">${rank.title}</div>
                                    <div class="timber-rank-description">${rank.description}</div>
                                </div>
                                
                                ${isNewHighScore ? `
                                    <div class="timber-new-highscore">
                                        <div class="timber-stat-label">New High Score!</div>
                                        <div class="timber-stat-value">${this.reputation} Reputation</div>
                                    </div>
                                ` : `
                                    <div class="timber-highscore">
                                        <div class="timber-stat-label">High Score</div>
                                        <div class="timber-stat-value">${this.highScore} Reputation</div>
                                    </div>
                                `}
                            </div>
                            
                            <div class="timber-matches-summary">
                                <h3>Your Matches</h3>
                                <div class="timber-matches-list">
                                    ${this.renderMatches()}
                                </div>
                            </div>
                            
                            <button class="btn btn-primary timber-play-again-btn" id="play-again-btn">
                                Play Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.startNewGame();
        });
    }

    getRankTitle(reputation) {
        if (reputation >= 100) return { title: "Legendary Alchemist", description: "Your potions are the stuff of legends!" };
        if (reputation >= 75) return { title: "Master Matchmaker", description: "You've mastered the art of mystical matchmaking." };
        if (reputation >= 50) return { title: "Skilled Brewmaster", description: "Your skills are respected throughout the realm." };
        if (reputation >= 25) return { title: "Apprentice Mixer", description: "You're learning the secrets of potion brewing." };
        if (reputation >= 0) return { title: "Novice Dabbler", description: "Everyone starts somewhere. Keep practicing!" };
        return { title: "Disgraced Charlatan", description: "Your failed potions have tarnished your reputation." };
    }

    startNewGame() {
        this.currentProfileIndex = 0;
        this.profiles = [];
        this.matches = [];
        this.reputation = 0;
        this.gold = this.baseGold; // Reset gold for new game
        this.nextProfileGold = this.baseGold; // Reset next profile gold
        this.passes = 4; // Reset passes for new game
        this.loadProfiles();
        this.gameState = 'profile';
        this.render();
        this.setupEventListeners();
    }

    renderProfileView(contentElement) {
        const profile = this.profiles[this.currentProfileIndex];
        if (!profile) {
            contentElement.innerHTML = `
                <div class="timber-content">
                    <div class="timber-header">
                        <div class="timber-title">Timber</div>
                    </div>
                    <div class="timber-empty">
                        <div class="timber-empty-message">You've seen all potential matches!</div>
                        <button class="btn btn-primary timber-reset-btn" id="reset-profiles">Find More Matches</button>
                    </div>
                    <div class="timber-panel timber-matches">
                        <h3>Your Matches</h3>
                        <div class="timber-matches-list" id="matches-list">
                            ${this.renderMatches()}
                        </div>
                    </div>
                </div>
            `;
            this.setupEmptyStateListeners();
            return;
        }

        contentElement.innerHTML = `
            <div class="timber-content">
                <div class="timber-header">
                    <div class="timber-logo timber-icon"></div>
                    <div class="timber-title">Timber</div>
                    <div class="timber-subtitle">Mystical Matchmaking</div>
                    <div class="timber-stats">
                        <div class="timber-stat">
                            <div class="timber-stat-label">Gold</div>
                            <div class="timber-stat-value">${this.gold}g</div>
                        </div>
                        <div class="timber-stat">
                            <div class="timber-stat-label">Passes</div>
                            <div class="timber-stat-value">${this.passes}</div>
                        </div>
                        <div class="timber-stat">
                            <div class="timber-stat-label">Reputation</div>
                            <div class="timber-stat-value">${this.reputation}</div>
                        </div>
                        <div class="timber-stat">
                            <div class="timber-stat-label">High Score</div>
                            <div class="timber-stat-value">${this.highScore}</div>
                        </div>
                    </div>
                </div>
                
                <div class="timber-main">
                    <div class="timber-layout">
                        <div class="timber-column timber-column-main">
                            <section class="timber-panel timber-profile-card">
                                <div class="timber-profile-image">
                                    <div class="timber-avatar">${profile.name.charAt(0)}</div>
                                    <div class="timber-element-badge">${profile.element}</div>
                                </div>
                                
                                <div class="timber-profile-info">
                                    <h2 class="timber-name">${profile.name}</h2>
                                    <div class="timber-details">
                                        <span class="timber-age">${profile.age} years old</span>
                                        <span class="timber-class">${profile.class}</span>
                                    </div>
                                    <div class="timber-compatibility">
                                        <div class="timber-compatibility-label">Compatibility</div>
                                        <div class="timber-compatibility-bar">
                                            <div class="timber-compatibility-fill" style="width: ${profile.compatibility}%"></div>
                                        </div>
                                        <div class="timber-compatibility-value">${profile.compatibility}%</div>
                                        <div class="timber-difficulty">${profile.difficulty || this.getDifficultyLevel(profile.compatibility)}</div>
                                    </div>
                                    <p class="timber-bio">${profile.bio}</p>
                                    <div class="timber-profile-hint">
                                        <strong>Hint:</strong> ${profile.hint}
                                    </div>
                                </div>
                            </section>

                            <div class="timber-actions">
                                <button class="btn timber-reject-btn" id="reject-profile">
                                    <span>✗</span> Pass (${this.passes} left)
                                </button>
                                <button class="btn timber-accept-btn" id="accept-profile">
                                    <span>♥</span> Brew Potion
                                </button>
                            </div>
                        </div>

                        <aside class="timber-column timber-column-sidebar">
                            <section class="timber-panel timber-matches">
                                <h3>Your Matches</h3>
                                <div class="timber-matches-list" id="matches-list">
                                    ${this.renderMatches()}
                                </div>
                            </section>
                        </aside>
                    </div>
                </div>
            </div>
        `;
        this.setupEventListeners();
    }

    renderMatches() {
        if (this.matches.length === 0) {
            return '<div class="timber-no-matches">No matches yet. Keep brewing!</div>';
        }

        return this.matches.map(match => `
            <div class="timber-match-item">
                <div class="timber-match-avatar">${match.name.charAt(0)}</div>
                <div class="timber-match-info">
                    <div class="timber-match-name">${match.name}</div>
                    <div class="timber-match-details">${match.element} • ${match.class}</div>
                </div>
                <div class="timber-match-compatibility">${match.compatibility}%</div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        const acceptBtn = document.getElementById('accept-profile');
        const rejectBtn = document.getElementById('reject-profile');

        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => this.acceptProfile());
        }

        if (rejectBtn) {
            rejectBtn.addEventListener('click', () => this.rejectProfile());
        }
    }

    setupEmptyStateListeners() {
        const resetBtn = document.getElementById('reset-profiles');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.currentProfileIndex = 0;
                this.profiles = [];
                this.loadProfiles();
                this.render();
                this.setupEventListeners();
            });
        }
    }

    acceptProfile() {
        const profile = this.profiles[this.currentProfileIndex];
        this.startPotionMinigame(profile);
    }

    rejectProfile() {
        if (this.passes > 0) {
            this.passes--;
            this.nextProfile();
        } else {
            this.showMessage("No passes remaining! You must brew a potion.");
        }
    }

    nextProfile() {
        this.currentProfileIndex++;

        // Set gold for next profile based on previous result
        if (this.currentProfileIndex < this.profiles.length) {
            this.gold = this.nextProfileGold;
        }

        // Check if game should end
        if (this.currentProfileIndex >= this.profiles.length || this.passes <= 0) {
            this.gameState = 'end';
        } else {
            this.gameState = 'profile';
        }

        this.render();
    }

    calculateTotalCost() {
        return this.selectedIngredients.reduce((total, ing) => {
            return total + this.INGREDIENT_COSTS[ing.rarity];
        }, 0);
    }

    updateMinigameUI() {
        // Update gold display
        const goldDisplay = document.querySelector('.timber-gold-value');
        if (goldDisplay) goldDisplay.textContent = `${this.gold}g`;

        // Update selected ingredients display
        const selectedList = document.querySelector('.timber-selected-list');
        if (selectedList) {
            selectedList.innerHTML = this.selectedIngredients.map(ing => `
                <div class="timber-selected-ingredient">
                    ${ing.name} (${this.INGREDIENT_COSTS[ing.rarity]}g)
                </div>
            `).join('');
        }

        // Update total cost
        const totalCost = document.querySelector('.timber-total-cost');
        if (totalCost) totalCost.textContent = `Total Cost: ${this.calculateTotalCost()}g`;

        // Update button states
        const brewBtn = document.getElementById('brew-potion-btn');
        if (brewBtn) {
            const canBrew = this.selectedIngredients.length === 3 && this.calculateTotalCost() <= this.gold;
            brewBtn.disabled = !canBrew;
        }

        const rerollBtn = document.getElementById('reroll-btn');
        if (rerollBtn) {
            rerollBtn.disabled = this.gold < this.REROLL_COST;
        }
    }

    startPotionMinigame(profile) {
        this.gameState = 'minigame';
        this.selectedIngredients = [];

        // Select 6 random ingredients for the puzzle
        const shuffledIngredients = [...this.ingredientDatabase].sort(() => Math.random() - 0.5);
        const puzzleIngredients = shuffledIngredients.slice(0, 6);

        // Generate optimal solution based on profile preferences
        const optimalIngredients = this.generateOptimalPotion(profile, 3);

        this.renderPotionMinigame(profile, puzzleIngredients, optimalIngredients);
    }

    generateOptimalPotion(profile, targetCount) {
        // Generate the optimal potion based on profile preferences
        const affinities = this.deriveAffinities(profile);

        // Score all available ingredients
        const scoredIngredients = this.ingredientDatabase
            .map(ing => {
                let score = 0;

                // Score aspects
                for (const aspect of ing.aspects) {
                    if (affinities.likes.has(aspect)) {
                        score += 2;
                    } else {
                        score -= 1;
                    }
                }

                // Score effects
                for (const effect of ing.effects || []) {
                    if (affinities.likes.has(effect)) {
                        score += this.EFFECT_WEIGHT;
                    } else {
                        score -= 1;
                    }
                }

                return { ingredient: ing, score };
            })
            .sort((a, b) => b.score - a.score);

        // Return top scoring ingredients
        return scoredIngredients.slice(0, targetCount).map(item => item.ingredient);
    }

    renderPotionMinigame(profile, allIngredients, correctIngredients) {
        const contentElement = document.getElementById(`${this.windowId}-content`);

        contentElement.innerHTML = `
            <div class="timber-minigame-content">
                <div class="timber-header">
                    <div class="timber-title">Brew a Potion of Attraction</div>
                    <div class="timber-gold-display">
                        <div class="timber-gold-label">Gold</div>
                        <div class="timber-gold-value">${this.gold}g</div>
                    </div>
                </div>
                
                <div class="timber-minigame-profile">
                    <h3>${profile.name}</h3>
                    <div class="timber-profile-hint">
                        <strong>Hint:</strong> ${profile.hint}
                    </div>
                </div>
                
                <div class="timber-minigame-instructions">
                    Select exactly 3 ingredients that match ${profile.name}'s preferences.
                    Costs: Common (1g), Uncommon (2g), Rare (3g).
                    Reroll costs 1g.
                </div>
                
                <div class="timber-minigame-ingredients">
                    ${allIngredients.map(ingredient => {
            const isSelected = this.selectedIngredients.some(selected => selected.id === ingredient.id);
            const selectedClass = isSelected ? 'selected' : '';
            const cost = this.INGREDIENT_COSTS[ingredient.rarity];
            const canAfford = this.gold >= cost;

            return `
                            <div class="timber-ingredient ${selectedClass} ${!canAfford ? 'disabled' : ''}"
                                 data-ingredient-id="${ingredient.id}"
                                 data-cost="${cost}">
                                <div class="timber-ingredient-name">${ingredient.name}</div>
                                <div class="timber-ingredient-rarity">${ingredient.rarity}</div>
                                <div class="timber-ingredient-cost">${cost}g</div>
                                <div class="timber-ingredient-aspects">${ingredient.aspects.join(', ')}</div>
                                <div class="timber-ingredient-effects">${ingredient.effects.join(', ')}</div>
                            </div>
                        `;
        }).join('')}
                </div>
                
                <div class="timber-selected-ingredients">
                    <div class="timber-selected-label">Selected (${this.selectedIngredients.length}/3):</div>
                    <div class="timber-selected-list">
                        ${this.selectedIngredients.map(ing => `
                            <div class="timber-selected-ingredient">
                                ${ing.name} (${this.INGREDIENT_COSTS[ing.rarity]}g)
                            </div>
                        `).join('')}
                    </div>
                    <div class="timber-total-cost">
                        Total Cost: ${this.calculateTotalCost()}g
                    </div>
                </div>
                
                <div class="timber-minigame-actions">
                    <button class="btn btn-secondary" id="reroll-btn" ${this.gold < this.REROLL_COST ? 'disabled' : ''}>
                        Reroll (${this.REROLL_COST}g)
                    </button>
                    <button class="btn btn-primary" id="brew-potion-btn"
                            ${this.selectedIngredients.length !== 3 || this.calculateTotalCost() > this.gold ? 'disabled' : ''}>
                        Brew Potion
                    </button>
                </div>
            </div>
        `;

        // Setup ingredient selection
        const ingredientElements = contentElement.querySelectorAll('.timber-ingredient');
        ingredientElements.forEach(el => {
            el.addEventListener('click', () => {
                const ingredientId = el.dataset.ingredientId;
                const cost = parseInt(el.dataset.cost);
                const ingredient = allIngredients.find(ing => ing.id === ingredientId);

                // Check if can afford
                if (this.gold < cost) {
                    this.showMessage("Not enough gold!");
                    return;
                }

                // Toggle selection
                if (this.selectedIngredients.some(selected => selected.id === ingredientId)) {
                    this.selectedIngredients = this.selectedIngredients.filter(selected => selected.id !== ingredientId);
                    el.classList.remove('selected');
                } else {
                    // Limit selection to 3 ingredients
                    if (this.selectedIngredients.length < 3) {
                        this.selectedIngredients.push(ingredient);
                        el.classList.add('selected');
                    } else {
                        this.showMessage("You can only select 3 ingredients!");
                    }
                }

                // Update UI
                this.updateMinigameUI();
            });
        });

        // Setup reroll button
        document.getElementById('reroll-btn').addEventListener('click', () => {
            if (this.gold >= this.REROLL_COST) {
                this.gold -= this.REROLL_COST;
                this.selectedIngredients = [];

                // Get new random ingredients
                const shuffledIngredients = [...this.ingredientDatabase].sort(() => Math.random() - 0.5);
                this.currentIngredients = shuffledIngredients.slice(0, 6);

                this.renderPotionMinigame(profile, this.currentIngredients, correctIngredients);
            } else {
                this.showMessage("Not enough gold to reroll!");
            }
        });

        // Setup brew button
        document.getElementById('brew-potion-btn').addEventListener('click', () => {
            if (this.selectedIngredients.length !== 3) {
                this.showMessage("Select exactly 3 ingredients!");
                return;
            }

            const totalCost = this.calculateTotalCost();
            if (totalCost > this.gold) {
                this.showMessage("Not enough gold!");
                return;
            }

            this.gold -= totalCost;
            this.checkPotion(this.selectedIngredients, correctIngredients, profile);
        });
    }

    showMessage(message) {
        // Create a temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = 'timber-message';
        messageEl.textContent = message;
        document.body.appendChild(messageEl);

        // Remove after 2 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 2000);
    }

    checkPotion(selectedIngredients, correctIngredients, profile) {
        const result = this.scorePotion(selectedIngredients, profile);
        const success = result.outcome !== "No Match" && result.outcome !== "Awkward";

        // Check if selected ingredients match the optimal solution
        const isOptimal = correctIngredients.every(correct =>
            selectedIngredients.some(selected => selected.id === correct.id)
        ) && selectedIngredients.length === correctIngredients.length;

        const contentElement = document.getElementById(`${this.windowId}-content`);

        // Calculate reputation change
        let reputationChange = 0;
        if (result.total >= 0) {
            reputationChange = this.REPUTATION_REWARDS[result.outcome] || 0;
        } else {
            // Failed potions lose reputation equal to negative score
            reputationChange = result.total;
        }

        // Calculate gold reward
        const goldReward = this.GOLD_REWARDS[result.outcome] || 0;

        // Update reputation
        this.reputation += reputationChange;

        // Update gold for next profile based on success
        if (success) {
            // Winning attempts increase gold by 4 for the next profile
            this.nextProfileGold = this.gold + 4;
        } else {
            // Failed attempts keep the same gold for the next profile
            this.nextProfileGold = this.gold;
        }

        // Add gold reward for successful matches (bonus for current profile)
        if (goldReward > 0) {
            this.gold += goldReward;
        }

        // Add to matches if successful
        if (success) {
            this.matches.push(profile);
        }

        // Update high score
        if (this.reputation > this.highScore) {
            this.highScore = this.reputation;
            localStorage.setItem('timber_high_score', this.highScore.toString());
        }

        const successMessage = isOptimal ?
            "Perfect! You found the optimal combination!" :
            success ?
                "Good choice! The potion worked!" :
                "The potion was unstable and didn't work.";

        contentElement.innerHTML = `
            <div class="timber-minigame-result">
                <h2 class="${success ? 'success' : 'failure'}">${success ? 'Success!' : 'Potion Fizzled!'}</h2>
                <div class="timber-result-details">
                    <p>${successMessage}</p>
                    <div class="timber-score-breakdown">
                        <div>Potion Score: ${Math.floor(result.total)}</div>
                        <div>Outcome: ${result.outcome}</div>
                        <div>Reputation Change: ${reputationChange > 0 ? '+' : ''}${reputationChange}</div>
                        <div>Gold Reward: +${goldReward}g</div>
                        <div>Current Reputation: ${this.reputation}</div>
                        <div>Current Gold: ${this.gold}g</div>
                        <div>Next Profile Gold: ${this.nextProfileGold}g</div>
                        <div>High Score: ${this.highScore}</div>
                    </div>
                    ${result.details.synergies.length > 0 ? `
                        <div class="timber-synergy-breakdown">
                            <h4>Synergy Bonuses:</h4>
                            ${result.details.synergies.map(syn => `
                                <div class="timber-synergy">
                                    <strong>${syn.name}:</strong> +${syn.bonus}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    ${result.details.contradictions.length > 0 ? `
                        <div class="timber-contradiction-breakdown">
                            <h4>Contradictions:</h4>
                            ${result.details.contradictions.map(con => `
                                <div class="timber-contradiction">
                                    <strong>${con.name}:</strong> ${con.effect}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    ${result.details.ingredients.length > 0 ? `
                        <div class="timber-ingredient-breakdown">
                            <h4>Ingredient Details:</h4>
                            ${result.details.ingredients.map(ing => `
                                <div class="timber-ingredient-detail">
                                    <strong>${ing.name}:</strong>
                                    ${ing.hits.length > 0 ? `<span class="timber-hit">${ing.hits.join(', ')}</span>` : ''}
                                    ${ing.penalties.length > 0 ? `<span class="timber-penalty">${ing.penalties.join(', ')}</span>` : ''}
                                    <span class="timber-score">Score: ${ing.score}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="timber-result-actions">
                    <button class="btn btn-primary" id="continue-btn">Continue</button>
                </div>
            </div>
        `;

        document.getElementById('continue-btn').addEventListener('click', () => {
            this.nextProfile();
        });
    }

    cleanup() {
        // Clean up any event listeners or resources
        console.log('Timber app cleaned up');
    }
}

// Initialize function for the app
function initTimberApp(windowId) {
    window.timberApp = new TimberApp(windowId);
}

// Register the app
window.MorrowindOS = window.MorrowindOS || {};
window.MorrowindOS.apps = window.MorrowindOS.apps || {};
window.MorrowindOS.apps.timber = initTimberApp;

// Cleanup function
function cleanupTimberApp(appName, windowId) {
    if (appName === 'timber' && window.timberApp) {
        window.timberApp.cleanup();
        window.timberApp = null;
    }
}

// Load app content function
function loadTimberAppContent(appName, windowId) {
    if (appName === 'timber') {
        // Content is already loaded by the TimberApp constructor
        console.log('Timber content loaded');
    }
}
