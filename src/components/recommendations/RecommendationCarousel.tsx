
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecommendations } from '../../hooks/useRecommendations';
import { Channel } from '../../types/playlist';
import { Button } from '@/components/ui/button';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface RecommendationCarouselProps {
  channels: Channel[];
}

export const RecommendationCarousel: React.FC<RecommendationCarouselProps> = ({ channels }) => {
  const { recommendations, loading } = useRecommendations(channels);
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <div className="py-4">
        <h2 className="text-xl font-semibold text-steadystream-gold mb-4 px-4">Recommended For You</h2>
        <Carousel className="w-full">
          <CarouselContent>
            {Array(5).fill(0).map((_, index) => (
              <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/4">
                <Card className="bg-black border-steadystream-gold/20">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-3/4 bg-steadystream-gold/10" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="aspect-video relative rounded overflow-hidden bg-steadystream-gold/5">
                      <Skeleton className="h-full w-full absolute inset-0" />
                    </div>
                    <Skeleton className="h-4 w-1/2 mt-3 bg-steadystream-gold/10" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-full bg-steadystream-gold/10" />
                  </CardFooter>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    );
  }
  
  if (recommendations.length === 0) {
    return null;
  }
  
  return (
    <div className="py-4">
      <h2 className="text-xl font-semibold text-steadystream-gold mb-4 px-4">Recommended For You</h2>
      <Carousel className="w-full">
        <CarouselContent>
          {recommendations.map((rec) => {
            const channel = channels.find(c => c.id === rec.channelId);
            if (!channel) return null;
            
            return (
              <CarouselItem key={rec.channelId} className="md:basis-1/3 lg:basis-1/4">
                <Card className="bg-black border-steadystream-gold/20 hover:gold-glow transition-shadow duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-steadystream-gold-light text-base truncate">{rec.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="aspect-video relative rounded overflow-hidden bg-steadystream-gold/5 flex items-center justify-center">
                      {rec.logo ? (
                        <img 
                          src={rec.logo} 
                          alt={rec.name} 
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }} 
                        />
                      ) : (
                        <div className="text-steadystream-gold/30 text-sm">No Preview</div>
                      )}
                    </div>
                    <p className="text-xs text-steadystream-secondary mt-3">{rec.reason}</p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-gold-gradient hover:bg-gold-gradient-hover text-black"
                      onClick={() => navigate(`/player/${rec.channelId}`)}
                    >
                      <Play className="h-4 w-4 mr-1" /> Watch Now
                    </Button>
                  </CardFooter>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="-left-4 bg-black border-steadystream-gold/20 text-steadystream-gold" />
        <CarouselNext className="-right-4 bg-black border-steadystream-gold/20 text-steadystream-gold" />
      </Carousel>
    </div>
  );
};
