import moment from 'moment-timezone';

export const formatUnix = (date: Date): number => {
    return moment.tz(date, 'Asia/Jakarta').unix();
};

export const formatIndonesia = (date: Date): string => {
    return moment.tz(date, 'Asia/Jakarta').locale('id-ID').format('DD, MMMM YYYY HH:mm:ss') + ' WIB';
};
