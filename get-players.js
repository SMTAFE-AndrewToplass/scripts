// Get information for multiple players on an NRL team, returns a sql query.
// run at: https://www.nrl.com/players/
await (async function () {
  const teamIds = [
    'Storm', 'Panthers', 'Roosters', 'Sharks', 'Cowboys', 'Bulldogs',
    'Sea Eagles', 'Knights', 'Raiders', 'Dolphins', 'Dragons', 'Broncos',
    'Warriors', 'Titans', 'Eels', 'Rabbitohs', 'Wests Tigers'
  ];
  const allPlayers = [...document.querySelectorAll('a.card-themed-hero-profile')];
  // Holds the extracted data from player pages.
  const playerData = [];
  // Limit the amount of players per team.
  const playerLimit = 5;

  for (const player of allPlayers.splice(0, playerLimit)) {
    const url = player.href;
    playerData.push(await getPlayerData(url));
  }

  // SQL query
  const comment = `/* Team: ${playerData?.[0]?.['team'] ?? 'Unknown'} */`;
  const header = `INSERT INTO Players (TeamId, Name, DateOfBirth, BirthPlace, NickName, HeightCm, WeightKg) VALUES`;
  const values = [];
  for (const player of playerData) {
    const pTeamId = teamIds.indexOf(player['team']) + 1;

    const pName = toSqlString(player['name']);
    const pDateOfBirth = toSqlString(toSqlDate(player['date-of-birth']));
    const pBirthPlace = toSqlString(player['birthplace']);
    const pNickName = toSqlString(player['nickname']);

    const pHeightCm = (player['height'] ?? 'NULL').replace(' cm', '');
    const pWeightKg = (player['weight'] ?? 'NULL').replace(' kg', '');

    values.push(`(${pTeamId}, ${pName}, ${pDateOfBirth}, ${pBirthPlace}, ${pNickName}, ${pHeightCm}, ${pWeightKg})`);
  }
  // Combine everything into the final query.
  const query = `${comment}\n${header}\n${values.join(',\n')};`
  // return [query, playerData];
  return query;

  // Open player page and extract data, returns an object containg data.
  async function getPlayerData(url) {
    const win = open(url, '_blank');
    return new Promise(resolve => {
      // When page loads, extract data from it.
      win.addEventListener('load', e => {
        const result = {};

        result['team'] = win.document.querySelector('.club-card__logo-svg')?.alt;

        const nameElm = win.document.querySelector('.club-card__title');
        if (nameElm)
          result['name'] = nameElm.textContent.trim().replaceAll(/\s+/g, ' ');

        const positionElm = win.document.querySelector('.club-card__position');
        if (positionElm?.textContent.includes('Captain'))
          result['is-captain'] = 'true';

        const dataList = win.document.querySelectorAll('main .l-content section dl');

        // Data is grouped into multiple dl elements.
        for (const group of dataList) {
          for (const entries of group.children) {
            const dt = entries.querySelector('dt');
            const dd = entries.querySelector('dd');
            if (dt && dd) {
              // Format key as lower-kebab-case.
              const key = dt.textContent
                .toLowerCase()
                .replaceAll(' ', '-')
                .replaceAll(':', '');
              const value = dd.textContent;
              // Invalid data should be left out.
              if (value && value !== '-')
                result[key] = value;
            }
          }
        }
        // Close the browser tab.
        win.close();
        // Return data after extraction.
        resolve(result);
      });
    });
  }

  // Converts a date from DD Month YYYY to YYYY/MM/DD.
  function toSqlDate(date) {
    const components = date?.split(' ');
    const months = ['january', 'feburary', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

    const year = components?.[2];
    const month = months.indexOf(components?.[1]?.toLowerCase()) + 1;
    const day = components?.[0];

    if (year && month && day)
      return `${year}/${month}/${day}`
    return null;
  }

  // Returns a single-quotes string or string containing NULL.
  function toSqlString(str) {
    if (str == null || str === 'NULL')
      return 'NULL';
    // Make sure single quotes are escaped properly.
    const result = str.replaceAll("'", "''");
    return `'${result}'`;
  }
})();
