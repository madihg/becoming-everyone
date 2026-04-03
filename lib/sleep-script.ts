export interface SleepLine {
  text: string;
  duration: number; // ms to display before next line
  isQuote?: boolean;
  isStanzaBreak?: boolean;
}

export const SLEEP_SCRIPT: SleepLine[] = [
  { text: "I remember stopping mid-sentence.", duration: 3500 },
  { text: "Struggled to reach the end.", duration: 3000 },
  { text: "The last five minutes of the keynote", duration: 3500 },
  { text: "took ten minutes to complete.", duration: 3500 },
  { text: "I had to pause a full minute", duration: 3000 },
  {
    text: "just to deliver a minute's worth of speech.",
    duration: 4000,
    isStanzaBreak: true,
  },

  { text: "The next week I couldn't order a coffee.", duration: 3500 },
  { text: "Words were receding to the higher shelves.", duration: 4000 },
  { text: "So I downloaded the apps", duration: 3000 },
  { text: "order ahead,", duration: 2000 },
  { text: "tap, walk, collect, retreat.", duration: 3500, isStanzaBreak: true },

  { text: "I spent days in silence.", duration: 3000 },
  { text: "Then weeks.", duration: 2500 },
  { text: "Not a single exchange with another being.", duration: 4000 },
  { text: "The mere thought of forming sounds", duration: 3500 },
  { text: "felt exhausting.", duration: 2500 },
  { text: "Made me want to lie down.", duration: 3500, isStanzaBreak: true },

  { text: "That's when the shift happened.", duration: 3500 },
  { text: "I started sleeping more.", duration: 3000 },
  { text: "Eight hours at first.", duration: 2500 },
  { text: "Then twelve.", duration: 2000 },
  { text: "Sixteen.", duration: 2000 },
  { text: "Twenty hours a day.", duration: 3000, isStanzaBreak: true },

  { text: "I let sleep eat my waking hours.", duration: 3500 },
  { text: "Turn day into night.", duration: 3000 },
  { text: "My life into one long nap.", duration: 3500, isStanzaBreak: true },

  { text: "A highly functioning sleepwalker:", duration: 3500 },
  { text: "sleeping in meetings,", duration: 2500 },
  { text: "while eating,", duration: 2000 },
  { text: "reading,", duration: 2000 },
  { text: "every moment", duration: 2000 },
  { text: "falling asleep", duration: 2500 },
  { text: "again,", duration: 2000 },
  { text: "letting go", duration: 2500 },
  { text: "into the ground", duration: 2500 },
  { text: "trusting every facet of reality", duration: 3500 },
  { text: "like I would a mattress.", duration: 4000, isStanzaBreak: true },

  { text: "When I finally started sleeping", duration: 3500 },
  { text: "twenty-four hours a day,", duration: 3000 },
  { text: "and the dreamer took the driver's seat,", duration: 4000 },
  { text: "sleep became ...", duration: 4000 },
  { text: "my medium", duration: 3000 },
  { text: "my practice", duration: 3500, isStanzaBreak: true },

  { text: "Right around the time", duration: 3000 },
  { text: "When the moniker \u00ab the sleep artist \u00bb", duration: 4000 },
  { text: "Began to stick in local newspapers", duration: 3500 },
  { text: "Curators began emailing:", duration: 3000 },
  { text: '"Can we exhibit your sleep state?"', duration: 4000, isQuote: true },
  { text: "They placed a webcam over my bed.", duration: 3500 },
  { text: 'Labelled it "Live Performance"', duration: 3500 },
  { text: "Wrote headlines:", duration: 2500 },
  {
    text: '"The artist explores productivity\'s afterlife"',
    duration: 5000,
    isQuote: true,
    isStanzaBreak: true,
  },

  { text: "I was nominated for a residency.", duration: 3500 },
  { text: "(I stayed in bed.)", duration: 3000 },
  { text: "The Times called me the Patron Saint of Burnout.", duration: 4500 },
  { text: "(I didn't comment.)", duration: 3000 },
  { text: "I was invited to speak on a panel.", duration: 3500 },
  {
    text: "(My agent sent an audio of my breath.)",
    duration: 4500,
    isStanzaBreak: true,
  },

  {
    text: "Eventually, the Centre Pompidou acquired my nap.",
    duration: 5000,
    isStanzaBreak: true,
  },

  { text: "They installed me between a Nam June Paik", duration: 4000 },
  { text: "and a haunted Roomba.", duration: 3500 },
  { text: "Visitors now come in procession,", duration: 3500 },
  { text: "pilgrims of sorts", duration: 3000 },
  { text: "They leave coins, trinkets,", duration: 3000 },
  { text: "objects of devotion", duration: 3000 },
  { text: "on and around my unconscious body.", duration: 4000 },
  {
    text: "I am surrounded by melting candles",
    duration: 4000,
    isStanzaBreak: true,
  },

  { text: "They ask:", duration: 2500 },
  { text: '"Is he sleeping?"', duration: 3000, isQuote: true },
  { text: '"Is this part of it?"', duration: 3000, isQuote: true },
  { text: "No one can tell.", duration: 3500 },
  { text: "Not even me.", duration: 5000 },
];
