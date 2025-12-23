/**
 * Guest Ministers Configuration
 * 
 * Configure the ministers invited for the Emergence Concert.
 * Add minister names and Cloudinary image URLs here.
 * 
 * Last Updated: December 23, 2025
 */

export interface GuestMinister {
    name: string;
    imageUrl?: string;
}

export const guestMinisters: GuestMinister[] = [
    {
        name: 'Moses Akoh',
        imageUrl: 'https://res.cloudinary.com/drzcrx4he/image/upload/v1766446476/Moses_Akoh_okvbce.jpg',
    },
    {
        name: 'Deborah Billy Ben',
        imageUrl: 'https://res.cloudinary.com/drzcrx4he/image/upload/v1766447297/BillyBen_cajxih.webp',
    },
    {
        name: 'Leke Gospel',
        imageUrl: 'https://res.cloudinary.com/drzcrx4he/image/upload/e_improve,e_sharpen/v1766446475/Leke_Gospel_byaam4.jpg',
    },
    {
        name: 'Jeffson Odiete',
        imageUrl: 'https://res.cloudinary.com/drzcrx4he/image/upload/v1766446475/Jeff_ozydhn.jpg',
    },
    {
        name: 'Tee worship',
        imageUrl: 'https://res.cloudinary.com/drzcrx4he/image/upload/v1766446475/Tee_Worship_ngqblk.jpg'
    }
];
