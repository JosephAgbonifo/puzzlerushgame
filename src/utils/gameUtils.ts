import { Letter, LetterSet } from '../types/game';

// Common English letter frequencies for realistic letter generation
const letterFrequencies = {
  'A': 8.12, 'B': 1.49, 'C': 2.78, 'D': 4.25, 'E': 12.02, 'F': 2.23,
  'G': 2.02, 'H': 6.09, 'I': 6.97, 'J': 0.15, 'K': 0.77, 'L': 4.03,
  'M': 2.41, 'N': 6.75, 'O': 7.51, 'P': 1.93, 'Q': 0.10, 'R': 5.99,
  'S': 6.33, 'T': 9.06, 'U': 2.76, 'V': 0.98, 'W': 2.36, 'X': 0.15,
  'Y': 1.97, 'Z': 0.07
};

// Common letter combinations that work well together
const letterCombinations = [
  ['A', 'E', 'I', 'O', 'U', 'R', 'S', 'T'],
  ['B', 'R', 'A', 'I', 'N', 'S', 'T', 'E'],
  ['C', 'A', 'R', 'E', 'T', 'S', 'I', 'N'],
  ['D', 'A', 'R', 'E', 'S', 'T', 'I', 'N'],
  ['F', 'I', 'R', 'E', 'S', 'T', 'A', 'N'],
  ['G', 'R', 'A', 'I', 'N', 'S', 'T', 'E'],
  ['H', 'E', 'A', 'R', 'T', 'S', 'I', 'N'],
  ['L', 'A', 'T', 'E', 'R', 'S', 'I', 'N'],
  ['M', 'A', 'S', 'T', 'E', 'R', 'I', 'N'],
  ['P', 'L', 'A', 'N', 'T', 'E', 'R', 'S'],
  ['S', 'T', 'R', 'A', 'I', 'N', 'E', 'D'],
  ['T', 'R', 'A', 'I', 'N', 'E', 'D', 'S'],
  ['W', 'A', 'T', 'E', 'R', 'S', 'I', 'N'],
];

export const generateLetterSet = (level: number): LetterSet => {
  const numLetters = Math.min(8, Math.max(6, 5 + Math.floor(level / 2)));
  
  // Select a combination based on level
  const combinationIndex = (level - 1) % letterCombinations.length;
  const baseCombination = letterCombinations[combinationIndex];
  
  // Take the first numLetters from the combination
  const selectedLetters = baseCombination.slice(0, numLetters);
  
  // Generate Letter objects
  const letters: Letter[] = selectedLetters.map((char, index) => ({
    id: `letter-${index}`,
    char,
    index
  }));

  return {
    letters,
    centerLetter: selectedLetters[0]
  };
};

export const validateWord = async (word: string): Promise<boolean> => {
  // For this implementation, we'll use a simple validation
  // In a real app, you might want to use a more comprehensive dictionary API
  const normalizedWord = word.toLowerCase();
  
  // Basic validation - word must be at least 3 characters
  if (normalizedWord.length < 3) {
    return false;
  }
  
  // Simple pattern matching for common English words
  const commonPatterns = [
    /^(the|and|for|are|but|not|you|all|can|had|her|was|one|our|out|day|get|has|him|his|how|man|new|now|old|see|two|who|boy|did|its|let|put|say|she|too|use|way)$/,
    /^(art|car|cat|dog|eat|eye|far|fun|got|hot|job|lot|may|run|sun|ten|yes|yet|red|big|end|ask|men|try|own|war|oil|sit|set|win|low|cut|hit|law|arm|age|act|air|bit|box|cup|die|ear|egg|few|fly|gun|ice|joy|key|lie|map|net|pen|pot|row|sea|sky|top|toy|van|wet|zoo)$/,
    /^(that|with|have|this|will|your|from|they|know|want|been|good|much|some|time|very|when|come|here|just|like|long|make|many|over|such|take|than|them|well|were|what|year)$/,
    /^(back|call|came|each|even|find|give|hand|high|keep|last|left|life|live|look|made|most|move|must|name|need|next|open|part|play|read|said|same|seem|show|side|tell|turn|used|want|ways|week|went|word|work)$/,
    /^(best|both|care|door|down|face|fact|feel|feet|fire|food|form|four|free|game|girl|gone|head|help|home|hope|hour|idea|kind|knew|land|late|line|list|love|mind|near|once|only|talk|team|told|took|tree|true|type|walk|wall|wife|wind)$/,
    /^(about|after|again|black|could|first|found|great|group|house|large|never|other|place|point|right|small|sound|still|three|under|water|where|while|world|would|write|years|young)$/,
    /^(above|among|began|being|below|build|carry|clean|clear|close|every|final|given|going|green|happy|heard|heart|heavy|human|light|lived|local|might|music|night|north|often|order|paper|party|peace|phone|piece|plant|power|press|price|quick|quiet|quite|reach|shall|short|since|space|speak|spent|stage|start|state|story|study|third|those|trade|tried|using|value|voice|watch|white|whole|whose|woman|words|worse|worst|worth|wrong|wrote)$/,
    /^(train|brain|drain|grain|stain|strain|plain|rain|main|pain|gain|sane|lane|cane|mane|pane|tame|name|game|fame|same|came|time|lime|dime|mine|fine|line|nine|pine|wine|vine|dine|sine|ride|side|hide|wide|tide|code|mode|node|rode|fade|made|jade|wade|rate|late|date|gate|hate|fate|mate|care|dare|fare|hare|mare|rare|ware|bare|tale|pale|male|sale|dale|vale|kale|bale|hale|gale)$/,
    /^(read|dead|head|lead|bread|thread|spread|dread|real|deal|heal|meal|seal|teal|peal|zeal|dear|fear|gear|hear|near|pear|rear|tear|wear|year|bear|clear|great|treat|wheat|heat|meat|neat|peat|seat|beat|feat|tree|free|three|green|seen|been|keen|teen|queen|screen|scene|stone|phone|alone|throne|drone|prone|clone|zone|tone|bone|cone|done|gone|none|hone|lone|more|core|bore|fore|lore|pore|sore|tore|wore|yore|shore|store|score|before|horse|nurse|purse|curse|verse|terse|diverse|reverse|universe)$/,
    (time|dime|lime|mime|prime|crime|chime|rhyme|thyme|slime|grime|climb|water|later|after|winter|summer|matter|better|letter|center|master|faster|sister|mister|lister|blister|twister|whisper|hamster|lobster|monster|cluster|plaster|disaster|register|character|diameter|parameter|computer|chapter|teacher|weather|feather|leather|gather|rather|father|mother|brother|another|other|river|never|fever|lever|sever|clever|however|forever|whenever|wherever|whatever|whoever|silver|finger|singer|linger|longer|hunger|danger|stranger|anger|hanger|ranger|ginger|tiger|fiber|timber|umber|number|lumber|chamber|slumber|member|remember|november|december|september|october|computer|chapter|weather|teacher|rather|father|mother|brother|another|other|gather|feather|leather|never|fever|lever|sever|clever|however|forever|whenever|wherever|whatever|whoever|silver|finger|singer|linger|longer|hunger|danger|stranger|anger|hanger|ranger|ginger|tiger|fiber|timber|lumber|chamber|slumber|member|remember|november|december|september|october)
  ];

  // Check if word matches any common pattern
  const isValid = commonPatterns.some(pattern => pattern.test(normalizedWord));
  
  return isValid;
};

export const getWordScore = (word: string, level: number): number => {
  const baseScore = word.length * 10;
  const levelMultiplier = 1 + (level - 1) * 0.1;
  
  // Bonus for longer words
  let lengthBonus = 0;
  if (word.length >= 6) lengthBonus = 20;
  if (word.length >= 7) lengthBonus = 40;
  if (word.length >= 8) lengthBonus = 60;
  
  return Math.floor((baseScore + lengthBonus) * levelMultiplier);
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Sound effects (using Web Audio API for better performance)
export const playSound = (type: 'select' | 'success' | 'error' | 'levelComplete') => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  switch (type) {
    case 'select':
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
      break;
    case 'success':
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      break;
    case 'error':
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
      break;
    case 'levelComplete':
      // Play a triumphant chord
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2);
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.4);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
      break;
  }
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.8);
};