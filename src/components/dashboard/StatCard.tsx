
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  isLoading: boolean;
}

const StatCard = ({ title, value, icon, isLoading }: StatCardProps) => (
  <Card>
    <CardContent className="flex flex-col items-center justify-center p-6">
      {isLoading ? (
        <>
          <Skeleton className="h-8 w-8 mb-2 rounded-full" />
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-4 w-20" />
        </>
      ) : (
        <>
          {icon}
          <div className="text-3xl font-bold">{value}</div>
          <p className="text-sm text-muted-foreground">{title}</p>
        </>
      )}
    </CardContent>
  </Card>
);

export default StatCard;
