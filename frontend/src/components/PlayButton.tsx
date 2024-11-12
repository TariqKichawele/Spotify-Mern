import { usePlayerStore } from '@/stores/usePlayerStore';
import { Song } from '@/types'
import { Play, Pause } from 'lucide-react';
import { Button } from './ui/button';

const PlayButton = ({ song }: { song: Song }) => {
    const { currentSong, isPlaying, setCurrentSong, togglePlay } = usePlayerStore();
    const isCurrentSong = song._id === currentSong?._id;

    const handlePlay = () => {
        if(isCurrentSong) togglePlay();
        else setCurrentSong(song);
    }

  return (
    <Button
		size={"icon"}
		onClick={handlePlay}
		className={`absolute bottom-3 right-2 bg-green-500 hover:bg-green-400 hover:scale-105 transition-all 
			opacity-0 translate-y-2 group-hover:translate-y-0 ${
			isCurrentSong ? "opacity-100" : "opacity-0 group-hover:opacity-100"
		}`}
	>
		{isCurrentSong && isPlaying ? (
			<Pause className='size-5 text-black' />
		) : (
			<Play className='size-5 text-black' />
		)}
	</Button>
  )
}

export default PlayButton