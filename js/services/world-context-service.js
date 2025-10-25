// Morrowind-OwS World Context Service
// Provides consistent world-building elements and shared context across apps

class WorldContextService {
    static getCurrentWorldState() {
        // Get current time in Morrowind context
        const now = new Date();
        const morrowindMonths = [
            'Morning Star', 'Sun\'s Dawn', 'First Seed', 'Rain\'s Hand', 
            'Second Seed', 'Midyear', 'Sun\'s Height', 'Last Seed',
            'Heartfire', 'Frostfall', 'Sun\'s Dusk', 'Evening Star'
        ];
        const monthName = morrowindMonths[now.getMonth()];
        const day = now.getDate();
        const year = now.getFullYear();
        
        // Current world events that can be referenced across apps
        const currentEvents = this.getCurrentEvents();
        
        return {
            time: {
                day: day,
                month: monthName,
                year: year,
                season: this.getSeason(now.getMonth())
            },
            location: 'Vvardenfell, Morrowind',
            atmosphere: this.getCurrentAtmosphere(),
            events: currentEvents,
            politicalClimate: this.getPoliticalClimate(),
            economy: this.getEconomicState(),
            supernatural: this.getSupernaturalState()
        };
    }
    
    static getSeason(month) {
        if (month >= 2 && month <= 4) return 'Spring - First Planting';
        if (month >= 5 && month <= 7) return 'Summer - Sun\'s Height';
        if (month >= 8 && month <= 10) return 'Fall - Harvest';
        return 'Winter - Sun\'s Dusk';
    }
    
    static getCurrentAtmosphere() {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) return 'Morning mist rises from the ashlands';
        if (hour >= 12 && hour < 18) return 'Afternoon sun beats down on ancient ruins';
        if (hour >= 18 && hour < 22) return 'Evening shadows lengthen across Vvardenfell';
        return 'Night falls, and the moons Masser and Secunda illuminate the landscape';
    }
    
    static getCurrentEvents() {
        // Dynamic events that change based on date to keep world fresh
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const eventIndex = dayOfYear % 20; // Cycle through 20 events
        
        const events = [
            'Imperial Legion increases patrols around Red Mountain',
            'Strange lights reported over Dwemer ruins',
            'Ashlander tribes gather for seasonal ceremony',
            'House Hlaalu announces new trade agreements',
            'Telvanni wizards conduct rare public experiments',
            'Pilgrims travel to Ghostgate in increasing numbers',
            'Skooma trade routes disrupted by Imperial crackdown',
            'Rare disease spreads in southern villages',
            'Ancient artifacts discovered in newly opened tomb',
            'Daedric worshipers become more active at night',
            'Mages Guild offers rewards for rare alchemical ingredients',
            'Blades spymaster seen meeting with House leaders',
            'Corprus disease cases reported near Ghostfence',
            'Vampire attacks increase in western regions',
            'Dwemer automatons activate unexpectedly',
            'Trade caravans disappear on Grazelands route',
            'Cult activity detected near ancestral tombs',
            'Dragon sightings reported in remote mountains',
            'Political tensions rise between Great Houses',
            'Magical anomalies detected around Red Mountain',
            'Rare celestial alignment approaches'
        ];
        
        return [events[eventIndex]];
    }
    
    static getPoliticalClimate() {
        return {
            tension: 'High tensions between Great Houses over territorial disputes',
            imperial: 'Empire maintains fragile control, but influence wanes',
            temple: 'Tribunal Temple loses followers to Sixth House cultists',
            underground: 'Thieves Guild and Dark Brotherhood compete for influence'
        };
    }
    
    static getEconomicState() {
        return {
            trade: 'Disrupted by increased Imperial inspections',
            resources: 'Ebony and Dwemer metals at premium prices',
            magic: 'Soul gems and enchanted items in high demand',
            illegal: 'Skooma trade moves to more remote locations'
        };
    }
    
    static getSupernaturalState() {
        return {
            daedric: 'Daedric princes show increased interest in Morrowind',
            magic: 'Magical energies fluctuate around Red Mountain',
            undead: 'Increased vampire and undead activity reported',
            divine: 'Tribunal\'s power appears to be weakening'
        };
    }
    
    static getSharedCharacters() {
        // Characters that can be referenced across both apps
        return {
            notableFigures: [
                'Divine Vivec', 'Almalexia', 'Sotha Sil', 'Jiub', 'Caius Cosades',
                'Dagoth Ur', 'King Helseth', 'Jarl Balgruuf', 'Fargoth'
            ],
            factions: [
                'Imperial Legion', 'Blades', 'Mages Guild', 'Fighters Guild',
                'Thieves Guild', 'Dark Brotherhood', 'Great House Hlaalu',
                'Great House Redoran', 'Great House Telvanni', 'Tribunal Temple'
            ],
            locations: [
                'Vivec City', 'Balmora', 'Ald\'ruhn', 'Sadrith Mora',
                'Red Mountain', 'Ghostgate', 'Mournhold', 'Solstheim'
            ]
        };
    }
    
    static getWorldContextForPrompt() {
        const worldState = this.getCurrentWorldState();
        const characters = this.getSharedCharacters();
        
        return `
=== MORROWIND WORLD CONTEXT ===
Current Time: ${worldState.time.day} of ${worldState.time.month}, ${worldState.time.year} (${worldState.time.season})
Location: ${worldState.location}
Atmosphere: ${worldState.atmosphere}

Current Events:
${worldState.events.map(event => `- ${event}`).join('\n')}

Political Climate:
- ${worldState.politicalClimate.tension}
- ${worldState.politicalClimate.imperial}
- ${worldState.politicalClimate.temple}
- ${worldState.politicalClimate.underground}

Economic State:
- Trade: ${worldState.economy.trade}
- Resources: ${worldState.economy.resources}
- Magic: ${worldState.economy.magic}
- Illegal: ${worldState.economy.illegal}

Supernatural Activity:
- Daedric: ${worldState.supernatural.daedric}
- Magic: ${worldState.supernatural.magic}
- Undead: ${worldState.supernatural.undead}
- Divine: ${worldState.supernatural.divine}

Notable Locations: ${characters.locations.join(', ')}
Major Factions: ${characters.factions.join(', ')}
Important Figures: ${characters.notableFigures.join(', ')}

=== END WORLD CONTEXT ===`;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorldContextService;
} else {
    window.WorldContextService = WorldContextService;
}