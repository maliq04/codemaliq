// Mock PageSpeed data for demonstration purposes
export function getMockPageSpeedData() {
  return {
    lighthouseResult: {
      categories: {
        performance: {
          score: 0.92,
          title: "Performance"
        },
        accessibility: {
          score: 0.98,
          title: "Accessibility"
        },
        "best-practices": {
          score: 0.95,
          title: "Best Practices"
        },
        seo: {
          score: 1.0,
          title: "SEO"
        }
      },
      audits: {
        "first-contentful-paint": {
          displayValue: "1.2 s",
          score: 0.9
        },
        "largest-contentful-paint": {
          displayValue: "2.1 s", 
          score: 0.85
        },
        "first-meaningful-paint": {
          displayValue: "1.4 s",
          score: 0.88
        },
        "speed-index": {
          displayValue: "2.3 s",
          score: 0.82
        },
        "interactive": {
          displayValue: "3.1 s",
          score: 0.78
        },
        "cumulative-layout-shift": {
          displayValue: "0.05",
          score: 0.95
        }
      }
    },
    loadingExperience: {
      metrics: {
        FIRST_CONTENTFUL_PAINT_MS: {
          percentile: 1200,
          category: "FAST"
        },
        LARGEST_CONTENTFUL_PAINT_MS: {
          percentile: 2100,
          category: "AVERAGE"
        },
        CUMULATIVE_LAYOUT_SHIFT_SCORE: {
          percentile: 0.05,
          category: "FAST"
        }
      }
    }
  }
}