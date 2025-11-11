'use client';

import { useState, useEffect } from 'react';

interface Player {
  name: string;
  hp: number;
  maxHp: number;
  level: number;
  exp: number;
  expToNext: number;
  attack: number;
  defense: number;
  gold: number;
  inventory: Item[];
}

interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  expReward: number;
  goldReward: number;
}

interface Item {
  name: string;
  type: 'potion' | 'weapon' | 'armor';
  value: number;
}

interface GameState {
  screen: 'start' | 'story' | 'battle' | 'victory' | 'defeat' | 'shop';
  storyNode: number;
  battleLog: string[];
}

interface Choice {
  text: string;
  next?: number;
  battle?: Enemy;
  reward?: {
    gold?: number;
    item?: Item;
  };
  heal?: number;
  shop?: {
    item: Item;
    cost: number;
  };
}

const STORIES: { text: string; choices: Choice[] }[] = [
  {
    text: "You awaken in a dark forest. The moon casts eerie shadows through the ancient trees. A mysterious path lies ahead, winding deeper into the unknown.",
    choices: [
      { text: "Follow the path cautiously", next: 1 },
      { text: "Search the area for supplies", next: 2 },
    ]
  },
  {
    text: "As you walk the path, you hear growling. A fierce wolf emerges from the shadows, its eyes glowing with hunger!",
    choices: [
      { text: "Fight the wolf!", battle: { name: "Dire Wolf", hp: 30, maxHp: 30, attack: 8, defense: 2, expReward: 25, goldReward: 15 } },
    ]
  },
  {
    text: "You discover an old chest hidden beneath some leaves. Inside you find a health potion and some gold!",
    choices: [
      { text: "Continue your journey", next: 1, reward: { gold: 20, item: { name: "Health Potion", type: "potion" as const, value: 30 } } },
    ]
  },
  {
    text: "Victory! The wolf flees into the darkness. You continue and find a small village ahead, lights flickering in windows.",
    choices: [
      { text: "Enter the village", next: 4 },
      { text: "Rest by the roadside", heal: 20, next: 4 },
    ]
  },
  {
    text: "The village elder approaches. 'Traveler! A goblin warband has been terrorizing our lands. Will you help us?'",
    choices: [
      { text: "Accept the quest", next: 5 },
      { text: "Visit the shop first", next: 6 },
    ]
  },
  {
    text: "You venture to the goblin camp. Their leader, a massive brute, challenges you to combat!",
    choices: [
      { text: "Face the Goblin Chief!", battle: { name: "Goblin Chief", hp: 50, maxHp: 50, attack: 12, defense: 4, expReward: 50, goldReward: 40 } },
    ]
  },
  {
    text: "The shop keeper shows you their wares. You can buy supplies here.",
    choices: [
      { text: "Buy Health Potion (30 gold)", shop: { item: { name: "Health Potion", type: "potion" as const, value: 30 }, cost: 30 }, next: 6 },
      { text: "Buy Iron Sword (50 gold, +5 ATK)", shop: { item: { name: "Iron Sword", type: "weapon" as const, value: 5 }, cost: 50 }, next: 6 },
      { text: "Leave shop", next: 5 },
    ]
  },
  {
    text: "The goblin chief falls! The village celebrates your victory. But dark clouds gather on the horizon...",
    choices: [
      { text: "Investigate the dark clouds", next: 8 },
      { text: "Rest and prepare", heal: 50, next: 8 },
    ]
  },
  {
    text: "A massive dragon descends from the sky! This is the true threat to the realm. The final battle begins!",
    choices: [
      { text: "Fight the Dragon!", battle: { name: "Ancient Dragon", hp: 100, maxHp: 100, attack: 18, defense: 8, expReward: 150, goldReward: 200 } },
    ]
  },
  {
    text: "The dragon is slain! You are hailed as a legendary hero. Peace returns to the land!",
    choices: [
      { text: "Start New Adventure", next: 0 },
    ]
  },
];

export default function Home() {
  const [player, setPlayer] = useState<Player>({
    name: "Hero",
    hp: 100,
    maxHp: 100,
    level: 1,
    exp: 0,
    expToNext: 100,
    attack: 10,
    defense: 3,
    gold: 50,
    inventory: [],
  });

  const [gameState, setGameState] = useState<GameState>({
    screen: 'start',
    storyNode: 0,
    battleLog: [],
  });

  const [enemy, setEnemy] = useState<Enemy | null>(null);
  const [message, setMessage] = useState<string>('');

  const startGame = () => {
    setGameState({ screen: 'story', storyNode: 0, battleLog: [] });
    setMessage('');
  };

  const makeChoice = (choice: any) => {
    if (choice.reward) {
      const newPlayer = { ...player };
      if (choice.reward.gold) {
        newPlayer.gold += choice.reward.gold;
      }
      if (choice.reward.item) {
        newPlayer.inventory.push(choice.reward.item);
      }
      setPlayer(newPlayer);
      setMessage(`Found ${choice.reward.gold || 0} gold!`);
    }

    if (choice.heal) {
      const newHp = Math.min(player.hp + choice.heal, player.maxHp);
      setPlayer({ ...player, hp: newHp });
      setMessage(`Restored ${choice.heal} HP!`);
    }

    if (choice.shop) {
      if (player.gold >= choice.shop.cost) {
        const newPlayer = { ...player };
        newPlayer.gold -= choice.shop.cost;
        newPlayer.inventory.push(choice.shop.item);
        if (choice.shop.item.type === 'weapon') {
          newPlayer.attack += choice.shop.item.value;
        } else if (choice.shop.item.type === 'armor') {
          newPlayer.defense += choice.shop.item.value;
        }
        setPlayer(newPlayer);
        setMessage(`Purchased ${choice.shop.item.name}!`);
      } else {
        setMessage('Not enough gold!');
        return;
      }
    }

    if (choice.battle) {
      setEnemy(choice.battle);
      setGameState({ ...gameState, screen: 'battle', battleLog: [] });
    } else if (choice.next !== undefined) {
      setTimeout(() => {
        setGameState({ ...gameState, storyNode: choice.next });
        setMessage('');
      }, 500);
    }
  };

  const attack = () => {
    if (!enemy) return;

    const damage = Math.max(1, player.attack - enemy.defense + Math.floor(Math.random() * 5));
    const newEnemy = { ...enemy, hp: enemy.hp - damage };

    const log = [...gameState.battleLog, `You deal ${damage} damage!`];

    if (newEnemy.hp <= 0) {
      log.push(`${enemy.name} defeated!`);

      const newExp = player.exp + enemy.expReward;
      const newGold = player.gold + enemy.goldReward;
      let newPlayer = { ...player, exp: newExp, gold: newGold };

      if (newExp >= player.expToNext) {
        newPlayer.level += 1;
        newPlayer.exp = newExp - player.expToNext;
        newPlayer.expToNext = Math.floor(player.expToNext * 1.5);
        newPlayer.maxHp += 20;
        newPlayer.hp = newPlayer.maxHp;
        newPlayer.attack += 3;
        newPlayer.defense += 2;
        log.push(`LEVEL UP! Now level ${newPlayer.level}!`);
      }

      setPlayer(newPlayer);
      setGameState({ ...gameState, battleLog: log });

      setTimeout(() => {
        setEnemy(null);
        setGameState({
          screen: 'story',
          storyNode: gameState.storyNode < STORIES.length - 1 ? gameState.storyNode + 1 : gameState.storyNode,
          battleLog: []
        });
      }, 2000);
      return;
    }

    const enemyDamage = Math.max(1, enemy.attack - player.defense + Math.floor(Math.random() * 4));
    const newHp = player.hp - enemyDamage;
    log.push(`${enemy.name} deals ${enemyDamage} damage!`);

    if (newHp <= 0) {
      setPlayer({ ...player, hp: 0 });
      setGameState({ screen: 'defeat', storyNode: 0, battleLog: log });
      return;
    }

    setPlayer({ ...player, hp: newHp });
    setEnemy(newEnemy);
    setGameState({ ...gameState, battleLog: log });
  };

  const usePotion = () => {
    const potionIndex = player.inventory.findIndex(item => item.type === 'potion');
    if (potionIndex === -1) return;

    const potion = player.inventory[potionIndex];
    const newHp = Math.min(player.hp + potion.value, player.maxHp);
    const newInventory = [...player.inventory];
    newInventory.splice(potionIndex, 1);

    setPlayer({ ...player, hp: newHp, inventory: newInventory });
    setGameState({
      ...gameState,
      battleLog: [...gameState.battleLog, `Used ${potion.name}! Restored ${potion.value} HP!`]
    });
  };

  const useItem = (index: number) => {
    const item = player.inventory[index];
    if (item.type === 'potion') {
      const newHp = Math.min(player.hp + item.value, player.maxHp);
      const newInventory = [...player.inventory];
      newInventory.splice(index, 1);
      setPlayer({ ...player, hp: newHp, inventory: newInventory });
      setMessage(`Used ${item.name}! Restored ${item.value} HP!`);
    }
  };

  const restart = () => {
    setPlayer({
      name: "Hero",
      hp: 100,
      maxHp: 100,
      level: 1,
      exp: 0,
      expToNext: 100,
      attack: 10,
      defense: 3,
      gold: 50,
      inventory: [],
    });
    setGameState({ screen: 'start', storyNode: 0, battleLog: [] });
    setEnemy(null);
    setMessage('');
  };

  if (gameState.screen === 'start') {
    return (
      <div className="container">
        <div className="game-container">
          <h1 className="game-title">⚔️ RPG ADVENTURE ⚔️</h1>
          <div className="story-panel" style={{ textAlign: 'center', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '1.3rem', marginBottom: '20px' }}>
              Welcome, brave adventurer!
            </p>
            <p style={{ fontSize: '1.1rem', color: '#a0aec0' }}>
              Your journey awaits. Fight monsters, level up, and save the realm!
            </p>
          </div>
          <div className="choices">
            <button className="choice-btn" onClick={startGame}>
              ⚔️ Begin Adventure
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.screen === 'defeat') {
    return (
      <div className="container">
        <div className="game-container">
          <h1 className="game-title" style={{ color: '#ef4444' }}>💀 DEFEAT 💀</h1>
          <div className="story-panel" style={{ textAlign: 'center', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '1.3rem', marginBottom: '20px' }}>
              You have fallen in battle...
            </p>
            <p style={{ fontSize: '1.1rem', color: '#a0aec0' }}>
              But heroes never give up!
            </p>
          </div>
          <div className="choices">
            <button className="choice-btn" onClick={restart}>
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="game-container">
        <h1 className="game-title">⚔️ RPG ADVENTURE ⚔️</h1>

        <div className="stats-panel">
          <div className="stat">
            <div className="stat-label">Level {player.level}</div>
            <div className="stat-value">{player.name}</div>
          </div>
          <div className="stat">
            <div className="stat-label">HP</div>
            <div className="stat-value">{player.hp} / {player.maxHp}</div>
            <div className="hp-bar">
              <div className="hp-fill" style={{ width: `${(player.hp / player.maxHp) * 100}%` }}></div>
            </div>
          </div>
          <div className="stat">
            <div className="stat-label">EXP</div>
            <div className="stat-value">{player.exp} / {player.expToNext}</div>
            <div className="exp-bar">
              <div className="exp-fill" style={{ width: `${(player.exp / player.expToNext) * 100}%` }}></div>
            </div>
          </div>
          <div className="stat">
            <div className="stat-label">Attack</div>
            <div className="stat-value">⚔️ {player.attack}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Defense</div>
            <div className="stat-value">🛡️ {player.defense}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Gold</div>
            <div className="stat-value">💰 {player.gold}</div>
          </div>
        </div>

        {gameState.screen === 'battle' && enemy && (
          <div className="battle-panel">
            <div className="enemy-info">
              <div className="enemy-name">⚔️ {enemy.name}</div>
              <div className="stat-value">{enemy.hp} / {enemy.maxHp} HP</div>
              <div className="hp-bar">
                <div className="hp-fill" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}></div>
              </div>
            </div>
            <div className="battle-actions">
              <button className="action-btn" onClick={attack}>
                ⚔️ Attack
              </button>
              <button
                className="action-btn"
                onClick={usePotion}
                disabled={!player.inventory.some(item => item.type === 'potion')}
              >
                🧪 Use Potion
              </button>
            </div>
          </div>
        )}

        {gameState.screen === 'story' && (
          <>
            <div className="story-panel">
              {message && <div className="level-up">{message}</div>}
              <p>{STORIES[gameState.storyNode].text}</p>
            </div>
            <div className="choices">
              {STORIES[gameState.storyNode].choices.map((choice, index) => (
                <button
                  key={index}
                  className="choice-btn"
                  onClick={() => makeChoice(choice)}
                  disabled={choice.shop && player.gold < choice.shop.cost}
                >
                  {choice.text}
                </button>
              ))}
            </div>
          </>
        )}

        {gameState.battleLog.length > 0 && (
          <div className="log">
            {gameState.battleLog.map((entry, index) => (
              <div key={index} className="log-entry">{entry}</div>
            ))}
          </div>
        )}

        {player.inventory.length > 0 && gameState.screen !== 'battle' && (
          <div className="inventory">
            <div className="inventory-title">🎒 Inventory</div>
            {player.inventory.map((item, index) => (
              <div key={index} className="item">
                <span>{item.name}</span>
                {item.type === 'potion' && (
                  <button className="use-btn" onClick={() => useItem(index)}>
                    Use
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
