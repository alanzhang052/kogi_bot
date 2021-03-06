const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

module.exports = {
    name: 'play',
    description: 'Joins a channel to play a video from Youtube',
    usage: '!play [URL]',
    async execute (message, args) {
        // TODO: Voice channel retrieval is incorrect
        const voiceChannel = message.user.voice.channel;
    
        if (!voiceChannel) 
            return message.channel.send('You need to be in a channel to execute this command!');

        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) 
            return message.channel.send('You dont have the correct permissions!');

        if (!args.length) 
            return message.channel.send('Please provide a URL or name!');

        const validURL = (str) =>{
            var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
            if (!regex.test(str)) {
                return false;
            } else {
                return true;
            }
        };

        if (validURL(args[0])) {

            const connection = await voiceChannel.join();
            const stream  = ytdl(args[0], {filter: 'audioonly'});

            connection.play(stream, {seek: 0, volume: 1})
            .on('finish', () =>{
                voiceChannel.leave();
            });

            await message.channel.send(`Now Playing Link!`);

        } else {
            const connection = await voiceChannel.join();

            const videoFinder = async (query) => {
                const videoResult = await ytSearch(query);

                return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
            };

            const video = await videoFinder(args.join(' '));

            if (video) {
                const stream  = ytdl(video.url, {filter: 'audioonly'});
                connection.play(stream, {seek: 0, volume: 1})
                .on('finish', () =>{
                    voiceChannel.leave();
                    message.channel.send('Finished playing current queue!');
                });

                await message.channel.send(`Now Playing ***${video.title}***`);
            } else {
                message.channel.send('No video results found');
            }
        }
    }
}