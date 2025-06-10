export function getRandomLetter(classification: string): string {
    
    let letters = ["A", "B", "C", "D", "E", "F", "G"]
    
    const filteredLetters = letters.filter((letter) => letter !== classification);
    return filteredLetters[Math.floor(Math.random() * filteredLetters.length)];
}