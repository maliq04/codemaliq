// Mock GitHub data based on maliq04's actual GitHub profile
export function getMockGithubData() {
  return {
    colors: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    totalContributions: 2, // Based on the "2 contributions in 2026" shown in the image
    months: [
      {
        firstDay: '2025-01-01',
        name: 'Jan',
        totalWeeks: 5
      },
      {
        firstDay: '2025-02-01',
        name: 'Feb',
        totalWeeks: 4
      },
      {
        firstDay: '2025-03-01',
        name: 'Mar',
        totalWeeks: 5
      },
      {
        firstDay: '2025-04-01',
        name: 'Apr',
        totalWeeks: 4
      },
      {
        firstDay: '2025-05-01',
        name: 'May',
        totalWeeks: 5
      },
      {
        firstDay: '2025-06-01',
        name: 'Jun',
        totalWeeks: 4
      },
      {
        firstDay: '2025-07-01',
        name: 'Jul',
        totalWeeks: 5
      },
      {
        firstDay: '2025-08-01',
        name: 'Aug',
        totalWeeks: 4
      },
      {
        firstDay: '2025-09-01',
        name: 'Sep',
        totalWeeks: 5
      },
      {
        firstDay: '2025-10-01',
        name: 'Oct',
        totalWeeks: 4
      },
      {
        firstDay: '2025-11-01',
        name: 'Nov',
        totalWeeks: 5
      },
      {
        firstDay: '2025-12-01',
        name: 'Dec',
        totalWeeks: 4
      }
    ],
    weeks: generateRealisticWeeks()
  }
}

function generateRealisticWeeks() {
  const weeks: any[] = []
  const startDate = new Date('2025-01-01')

  for (let week = 0; week < 52; week++) {
    const weekData = {
      contributionDays: [] as any[],
      firstDay: new Date(startDate.getTime() + week * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }

    for (let day = 0; day < 7; day++) {
      const date = new Date(startDate.getTime() + (week * 7 + day) * 24 * 60 * 60 * 1000)

      // Most days have no contributions (realistic pattern)
      let contributionCount = 0
      let color = '#ebedf0' // No contributions

      // Add some realistic activity - very sparse like the actual profile
      if (week < 2 && Math.random() < 0.1) {
        // Only early weeks have some activity
        contributionCount = Math.floor(Math.random() * 3) + 1 // 1-3 contributions
        if (contributionCount > 0) color = '#9be9a8' // Light green
        if (contributionCount > 1) color = '#40c463' // Medium green
      }

      weekData.contributionDays.push({
        color,
        contributionCount,
        date: date.toISOString().split('T')[0]
      })
    }

    weeks.push(weekData)
  }

  return weeks
}
