import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function TimetableLoading() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-48" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-1"></div>
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="font-medium text-center">
                  <Skeleton className="h-6 w-20 mx-auto" />
                </div>
              ))}
          </div>

          {Array(6)
            .fill(0)
            .map((_, timeIndex) => (
              <div key={timeIndex} className="grid grid-cols-6 gap-4 mt-4">
                <div>
                  <Skeleton className="h-4 w-16" />
                </div>
                {Array(5)
                  .fill(0)
                  .map((_, dayIndex) => (
                    <div key={dayIndex} className="min-h-24 border rounded-md p-1">
                      {Math.random() > 0.5 && (
                        <div className="p-2 h-full rounded-md">
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-3 w-16 mb-2" />
                          <Skeleton className="h-3 w-24 mb-2" />
                          <Skeleton className="h-3 w-20 mb-2" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
