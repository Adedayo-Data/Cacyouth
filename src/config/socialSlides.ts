/**
 * Social Media Slider Configuration
 * 
 * Configure the slides for the social media metrics slider.
 * The first slide is the title/intro, followed by Cloudinary-hosted images.
 * 
 * Last Updated: December 22, 2025
 */

export interface SocialSlide {
    type: 'title' | 'image';
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    platform?: string;
    views?: string; // e.g., "12.5K", "1.2M"
}

export const socialSlides: SocialSlide[] = [
    {
        type: 'title',
        title: 'Our Social Media Impact',
        subtitle: 'See how we\'re reaching and engaging thousands across our platforms',
    },
    {
        type: 'image',
        imageUrl: 'https://res.cloudinary.com/drzcrx4he/image/upload/v1766482526/d42e0764-21e0-4c4e-86c1-08744f199060.png',
        platform: 'Instagram',
        views: '243K',
    },
    {
        type: 'image',
        imageUrl: 'https://res.cloudinary.com/drzcrx4he/image/upload/v1766482683/a9a6a58d-2e05-43a4-8012-328b2710bff6.png',
        platform: 'Instagram',
        views: '7.4K',
    },
    {
        type: 'image',
        imageUrl: 'https://res.cloudinary.com/drzcrx4he/image/upload/v1766443702/Screenshot_2025-12-22_at_23-07-34_MEDAIYESE_REGIONAL_YOUTH_CHOIR_medaiyeseregionalyouthchoir_Instagram_photos_and_videos_qo2cv5.png',
        platform: 'Instagram',
        views: '1.3K',
    },
    {
        type: 'image',
        imageUrl: 'https://res.cloudinary.com/drzcrx4he/image/upload/v1766443703/Screenshot_2025-12-22_at_23-06-34_20_Cac_Medaiyese_Youthchoir_Reels_Facebook_zfmfri.png',
        platform: 'Facebook',
        views: '1.9K',
    },
    {
        type: 'image',
        imageUrl: 'https://res.cloudinary.com/drzcrx4he/image/upload/v1766443702/Screenshot_2025-12-22_at_23-07-16_MEDAIYESE_REGIONAL_YOUTH_CHOIR_medaiyeseregionalyouthchoir_Instagram_photos_and_videos_mpaetg.png',
        platform: 'Instagram',
        views: '1K',
    },
    {
        type: 'image',
        imageUrl: 'https://res.cloudinary.com/drzcrx4he/image/upload/v1766443702/Screenshot_2025-12-22_at_23-06-51_20_Cac_Medaiyese_Youthchoir_Reels_Facebook_bdeudy.png',
        platform: 'Facebook',
        views: '1.5K',
    },
    {
        type: 'image',
        imageUrl: 'https://res.cloudinary.com/drzcrx4he/image/upload/v1766443702/Screenshot_2025-12-22_at_23-07-00_20_Cac_Medaiyese_Youthchoir_Reels_Facebook_nyfgcq.png',
        platform: 'Instagram',
        views: '2.8K',
    },
    {
        type: 'image',
        imageUrl: 'https://res.cloudinary.com/drzcrx4he/image/upload/v1766443702/Screenshot_2025-12-22_at_23-06-46_20_Cac_Medaiyese_Youthchoir_Reels_Facebook_wplosf.png',
        platform: 'Facebook',
        views: '1.1K',
    },
];
