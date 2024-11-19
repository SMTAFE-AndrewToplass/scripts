{
  const teamIds = [
    'Storm',
    'Panthers',
    'Roosters',
    'Sharks',
    'Cowboys',
    'Bulldogs',
    'Sea Eagles',
    'Knights',
    'Raiders',
    'Dolphins',
    'Dragons',
    'Broncos',
    'Warriors',
    'Titans',
    'Eels',
    'Rabbitohs',
    'Wests Tigers',
  ];

  const ladderId = 1;
  
  let res = '';

  res += `INSERT INTO Ladder (Year, Round) VALUES `;

  const year = document.querySelector('button[aria-controls="season-dropdown"]')?.textContent.trim();
  const round = document.querySelector('button[aria-controls="round-dropdown"]')?.textContent.trim().match(/Round (\d+)/)[1] ?? '0';
  res += `(${year}, ${round});\n\n`;

  res += `INSERT INTO TeamResult (TeamID, LadderID, HomeWins, AwayWins, HomeLosses, AwayLosses, Draws, Byes) VALUES\n`;
  
  const table = document.querySelector('#ladder-table');
  const items = table.querySelectorAll(':scope > tbody > tr') ?? [];

  const teamresults = [];
  for (const e of items) {
    const team = e.children[3].textContent.trim();
    const homeWins = e.children[13].textContent.split('-')[0].trim();
    const homeLosses = e.children[13].textContent.split('-')[1].trim();
    const awayWins = e.children[14].textContent.split('-')[0].trim();
    const awayLosses = e.children[14].textContent.split('-')[1].trim();
    const byes = e.children[9].textContent.trim();
    const draws = e.children[7].textContent.trim();
    const result = `    /* ${team} */ (${teamIds.indexOf(team) + 1}, ${ladderId}, ${homeWins}, ${awayWins}, ${homeLosses}, ${awayLosses}, ${draws}, ${byes})`;
    teamresults.push(result);
  }
  res += teamresults.join(',\n');
  res += `;\n`
  console.log(res);
}