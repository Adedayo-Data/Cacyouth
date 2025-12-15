/**
 * Social Media Metrics Configuration
 * 
 * These values would be updated by the admin to reflect our current social media statistics.
 * The component will automatically display these metrics with a simulated API loading effect.
 * 
 * Last Updated: December 15, 2025
 */

export const socialMetricsConfig = {
    instagram: {
        handle: "@mryc_official",
        metrics: {
            followers: "12.5K",
            posts: "450",
            engagement: "8.2%",
            reach: "45K",
        },
        growth: {
            percentage: "+12.5%",
            progressBar: 75, // 0-100
        },
    },
    facebook: {
        handle: "MRYC Official",
        metrics: {
            followers: "25K",
            posts: "380",
            engagement: "6.5%",
            reach: "100K",
        },
        growth: {
            percentage: "+8.3%",
            progressBar: 65, // 0-100
        },
    },
    // Simulated API delay in milliseconds (makes it look like real API call)
    apiDelay: 1500,
};


