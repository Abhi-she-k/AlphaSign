export function getRandomLetter(classification: string): string {
    
    let letters = ["A", "B", "C", "D", "E", "F", "G", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R"]
    
    const filteredLetters = letters.filter((letter) => letter !== classification);
    return filteredLetters[Math.floor(Math.random() * filteredLetters.length)];
}