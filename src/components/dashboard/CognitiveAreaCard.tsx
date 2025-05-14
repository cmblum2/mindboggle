
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface CognitiveAreaCardProps {
  title: string;
  score: number;
  icon: React.ReactNode;
  description: string;
  isLoading: boolean;
}

const CognitiveAreaCard = ({ 
  title, 
  score, 
  icon, 
  description, 
  isLoading 
}: CognitiveAreaCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <>
          <Skeleton className="h-7 w-16 mb-2" />
          <Skeleton className="h-2 w-full mb-2" />
          <Skeleton className="h-4 w-40" />
        </>
      ) : (
        <>
          <div className="text-2xl font-bold">{score}%</div>
          <Progress value={score} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        </>
      )}
    </CardContent>
  </Card>
);

export default CognitiveAreaCard;
