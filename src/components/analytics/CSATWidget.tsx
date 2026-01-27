import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CSATWidgetProps {
  data: {
    average: number;
    count: number;
    distribution: { rating: number; count: number }[];
  } | null;
  loading?: boolean;
}

export function CSATWidget({ data, loading }: CSATWidgetProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Customer Satisfaction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.count === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Customer Satisfaction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
            <Star className="h-8 w-8 mb-2 opacity-50" />
            <p>No ratings yet</p>
            <p className="text-sm">Ratings will appear after customers submit feedback</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalResponses = data.distribution.reduce((acc, d) => acc + d.count, 0) || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Customer Satisfaction</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-6">
          {/* Average score */}
          <div className="text-center">
            <div className="flex items-center gap-1">
              <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
              <span className="text-4xl font-bold">{data.average.toFixed(1)}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {data.count} {data.count === 1 ? 'response' : 'responses'}
            </p>
          </div>

          {/* Distribution */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const ratingData = data.distribution.find(d => d.rating === rating);
              const count = ratingData?.count || 0;
              const percentage = Math.round((count / totalResponses) * 100);

              return (
                <div key={rating} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm">{rating}</span>
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  </div>
                  <Progress value={percentage} className="h-2 flex-1" />
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
