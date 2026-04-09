export interface SleepLine {
  text: string;
  duration: number; // ms to display before next line
  isQuote?: boolean;
  isStanzaBreak?: boolean;
}

export const SLEEP_SCRIPT: SleepLine[] = [
  { text: "I remember stopping mid-sentence.", duration: 2000 },
  { text: "Struggled to reach the end.", duration: 1800 },
  { text: "The last five minutes of the keynote", duration: 2000 },
  { text: "took ten minutes to complete.", duration: 2000 },
  { text: "I had to pause a full minute", duration: 1800 },
  {
    text: "just to deliver a minute's worth of speech.",
    duration: 2200,
    isStanzaBreak: true,
  },

  { text: "The next week I couldn't order a coffee.", duration: 2000 },
  { text: "Words were receding to the higher shelves.", duration: 2200 },
  { text: "So I downloaded the apps", duration: 1800 },
  { text: "order ahead,", duration: 1200 },
  { text: "tap, walk, collect, retreat.", duration: 2000, isStanzaBreak: true },

  { text: "I spent days in silence.", duration: 1800 },
  { text: "Then weeks.", duration: 1500 },
  { text: "Not a single exchange with another being.", duration: 2200 },
  { text: "The mere thought of forming sounds", duration: 2000 },
  { text: "felt exhausting.", duration: 1500 },
  { text: "Made me want to lie down.", duration: 2000, isStanzaBreak: true },

  { text: "That's when the shift happened.", duration: 2000 },
  { text: "I started sleeping more.", duration: 1800 },
  { text: "Eight hours at first.", duration: 1500 },
  { text: "Then twelve.", duration: 1200 },
  { text: "Sixteen.", duration: 1200 },
  { text: "Twenty hours a day.", duration: 1800, isStanzaBreak: true },

  { text: "I let sleep eat my waking hours.", duration: 2000 },
  { text: "Turn day into night.", duration: 1800 },
  { text: "My life into one long nap.", duration: 2000, isStanzaBreak: true },

  { text: "A highly functioning sleepwalker:", duration: 2000 },
  { text: "sleeping in meetings,", duration: 1500 },
  { text: "while eating,", duration: 1200 },
  { text: "reading,", duration: 1200 },
  { text: "every moment", duration: 1200 },
  { text: "falling asleep", duration: 1500 },
  { text: "again,", duration: 1200 },
  { text: "letting go", duration: 1500 },
  { text: "into the ground", duration: 1500 },
  { text: "trusting every facet of reality", duration: 2000 },
  { text: "like I would a mattress.", duration: 2200, isStanzaBreak: true },

  { text: "When I finally started sleeping", duration: 2000 },
  { text: "twenty-four hours a day,", duration: 1800 },
  { text: "and the dreamer took the driver's seat,", duration: 2200 },
  { text: "sleep became ...", duration: 2200 },
  { text: "my medium", duration: 1800 },
  { text: "my practice", duration: 2000, isStanzaBreak: true },

  { text: "Right around the time", duration: 1800 },
  { text: "When the moniker \u00ab the sleep artist \u00bb", duration: 2200 },
  { text: "Began to stick in local newspapers", duration: 2000 },
  { text: "Curators began emailing:", duration: 1800 },
  { text: '"Can we exhibit your sleep state?"', duration: 2200, isQuote: true },
  { text: "They placed a webcam over my bed.", duration: 2000 },
  { text: 'Labelled it "Live Performance"', duration: 2000 },
  { text: "Wrote headlines:", duration: 1500 },
  {
    text: '"The artist explores productivity\'s afterlife"',
    duration: 2800,
    isQuote: true,
    isStanzaBreak: true,
  },

  { text: "I was nominated for a residency.", duration: 2000 },
  { text: "(I stayed in bed.)", duration: 1800 },
  { text: "The Times called me the Patron Saint of Burnout.", duration: 2500 },
  { text: "(I didn't comment.)", duration: 1800 },
  { text: "I was invited to speak on a panel.", duration: 2000 },
  {
    text: "(My agent sent an audio of my breath.)",
    duration: 2500,
    isStanzaBreak: true,
  },

  {
    text: "Eventually, the Centre Pompidou acquired my nap.",
    duration: 2800,
    isStanzaBreak: true,
  },

  { text: "They installed me between a Nam June Paik", duration: 2200 },
  { text: "and a haunted Roomba.", duration: 2000 },
  { text: "Visitors now come in procession,", duration: 2000 },
  { text: "pilgrims of sorts", duration: 1800 },
  { text: "They leave coins, trinkets,", duration: 1800 },
  { text: "objects of devotion", duration: 1800 },
  { text: "on and around my unconscious body.", duration: 2200 },
  {
    text: "I am surrounded by melting candles",
    duration: 2200,
    isStanzaBreak: true,
  },

  { text: "They ask:", duration: 1500 },
  { text: '"Is he sleeping?"', duration: 1800, isQuote: true },
  { text: '"Is this part of it?"', duration: 1800, isQuote: true },
  { text: "No one can tell.", duration: 2000 },
  { text: "Not even me.", duration: 3000 },
];
