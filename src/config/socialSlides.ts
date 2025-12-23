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
}

export const socialSlides: SocialSlide[] = [
    {
        type: 'title',
        title: 'Our Social Media Impact',
        subtitle: 'See how we\'re reaching and engaging thousands across our platforms',
    },
    {
        type: 'image',
        imageUrl: 'https://res.cloudinary.com/drzcrx4he/image/upload/v1766443702/Screenshot_2025-12-22_at_23-07-34_MEDAIYESE_REGIONAL_YOUTH_CHOIR_medaiyeseregionalyouthchoir_Instagram_photos_and_videos_qo2cv5.png',
        platform: 'Instagram',
    },
    {
        type: 'image',
        imageUrl: 'https://res.cloudinary.com/drzcrx4he/image/upload/v1766443703/Screenshot_2025-12-22_at_23-06-34_20_Cac_Medaiyese_Youthchoir_Reels_Facebook_zfmfri.png',
        platform: 'Facebook',
    },
    {
        type: 'image',
        imageUrl: 'https://res.cloudinary.com/drzcrx4he/image/upload/v1766443702/Screenshot_2025-12-22_at_23-07-16_MEDAIYESE_REGIONAL_YOUTH_CHOIR_medaiyeseregionalyouthchoir_Instagram_photos_and_videos_mpaetg.png',
        platform: 'Instagram',
    },
    {
        type: 'image',
        imageUrl: 'https://res.cloudinary.com/drzcrx4he/image/upload/v1766443702/Screenshot_2025-12-22_at_23-06-51_20_Cac_Medaiyese_Youthchoir_Reels_Facebook_bdeudy.png',
        platform: 'Facebook',
    },
    {
        type: 'image',
        imageUrl: 'https://res.cloudinary.com/drzcrx4he/image/upload/v1766443702/Screenshot_2025-12-22_at_23-07-00_20_Cac_Medaiyese_Youthchoir_Reels_Facebook_nyfgcq.png',
        platform: 'Instagram',
    },
    {
        type: 'image',
        imageUrl: 'https://res.cloudinary.com/drzcrx4he/image/upload/v1766443702/Screenshot_2025-12-22_at_23-06-46_20_Cac_Medaiyese_Youthchoir_Reels_Facebook_wplosf.png',
        platform: 'Facebook',
    },
];
