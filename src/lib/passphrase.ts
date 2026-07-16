export interface PassphraseAssessment {
 acceptable: boolean;
 score: 0 | 1 | 2 | 3 | 4;
 message: string;
}

export function assessPassphrase(p: string): PassphraseAssessment {
 const len = p.length;
 const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(p)).length;
 const words = p.trim().split(/\s+/).filter(Boolean).length;

 // A 4-word passphrase OR 12+ chars with variety is the floor.
 let tempScore = 0;
 if (len >= 8) tempScore++;
 if (len >= 12) tempScore++;
 if (classes >= 3 || words >= 3) tempScore++;
 if (len >= 16 || words >= 4) tempScore++;
 const score = Math.min(4, tempScore) as PassphraseAssessment['score'];

 const acceptable = score >= 3;
 return {
 acceptable,
 score,
 message: acceptable
 ? 'Strong enough. Write it somewhere safe - it cannot be recovered if lost.'
 : 'Please choose a longer passphrase - four unrelated words works well (e.g. a short phrase only you would know).',
 };
}
