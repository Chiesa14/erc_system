import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  Star,
  ChevronRight,
  Filter
} from "lucide-react";
import { format, isSameDay } from "date-fns";

const events = [
  {
    id: 1,
    title: "Family Home Evening - Smith Family",
    date: new Date(2024, 0, 20), // January 20, 2024
    time: "7:00 PM",
    family: "Smith Family",
    type: "FHE",
    location: "Smith Home",
    attendees: 4,
    status: "Scheduled",
    description: "Weekly family home evening with scripture study and activities"
  },
  {
    id: 2,
    title: "Youth Service Project",
    date: new Date(2024, 0, 22), // January 22, 2024
    time: "9:00 AM",
    family: "Multiple Families",
    type: "Service",
    location: "Community Center",
    attendees: 12,
    status: "Confirmed",
    description: "Community service project - food bank volunteering"
  },
  {
    id: 3,
    title: "BCC Planning Session - Johnson Family",
    date: new Date(2024, 0, 25), // January 25, 2024
    time: "6:30 PM",
    family: "Johnson Family",
    type: "BCC",
    location: "Johnson Home",
    attendees: 5,
    status: "Scheduled",
    description: "Monthly BCC program planning and review session"
  },
  {
    id: 4,
    title: "Youth Activity Night",
    date: new Date(2024, 0, 27), // January 27, 2024
    time: "7:30 PM",
    family: "All Families",
    type: "Activity",
    location: "Church Building",
    attendees: 20,
    status: "Confirmed",
    description: "Monthly youth activity night with games and refreshments"
  },
  {
    id: 5,
    title: "Family Testimony Meeting",
    date: new Date(2024, 0, 28), // January 28, 2024
    time: "6:00 PM",
    family: "Williams Family",
    type: "Spiritual",
    location: "Williams Home",
    attendees: 3,
    status: "Pending",
    description: "Family testimony sharing and spiritual discussion"
  }
];

export default function ChurchCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEvents, setSelectedEvents] = useState(events);

  // Get events for selected date
  const eventsForSelectedDate = selectedEvents.filter(event => 
    selectedDate && isSameDay(event.date, selectedDate)
  );

  // Get all event dates for calendar highlighting
  const eventDates = events.map(event => event.date);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "FHE": return "bg-primary/20 text-primary-foreground border-primary/40";
      case "Service": return "bg-success/20 text-success-foreground border-success/40";
      case "BCC": return "bg-accent/20 text-accent-foreground border-accent/40";
      case "Activity": return "bg-warning/20 text-warning-foreground border-warning/40";
      case "Spiritual": return "bg-purple-500/20 text-purple-500 border-purple-500/40";
      default: return "";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed": return "bg-success/20 text-success-foreground border-success/40";
      case "Scheduled": return "bg-warning/20 text-warning-foreground border-warning/40";
      case "Pending": return "bg-muted text-muted-foreground border-muted/40";
      default: return "";
    }
  };

  // Custom day renderer to show dots for events
  const modifiers = {
    hasEvent: eventDates,
  };

  const modifiersStyles = {
    hasEvent: {
      position: 'relative' as const,
    }
  };

  const upcomingEvents = events
    .filter(event => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendar Overview</h1>
          <p className="text-muted-foreground">
            View all family activities, events, and program schedules
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <Filter className="h-4 w-4" />
          Filter Events
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold text-primary">{events.length}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-success/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold text-success">3</p>
              </div>
              <Clock className="h-8 w-8 text-success/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Families</p>
                <p className="text-2xl font-bold text-accent">8</p>
              </div>
              <Users className="h-8 w-8 text-accent/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Attendance</p>
                <p className="text-2xl font-bold text-warning">85%</p>
              </div>
              <Star className="h-8 w-8 text-warning/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Event Calendar
            </CardTitle>
            <CardDescription>
              Click on any date to view scheduled events
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              Upcoming Events
            </CardTitle>
            <CardDescription>
              Next scheduled activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {format(event.date, "MMM d")} at {event.time}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="outline" className={getTypeColor(event.type)}>
                          {event.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Events for {format(selectedDate, "MMMM d, yyyy")}
            </CardTitle>
            <CardDescription>
              {eventsForSelectedDate.length} event(s) scheduled for this date
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventsForSelectedDate.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No events scheduled for this date
              </p>
            ) : (
              <div className="grid gap-4">
                {eventsForSelectedDate.map((event) => (
                  <Card key={event.id} className="bg-gradient-to-br from-card to-muted/5">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{event.title}</h3>
                              <Badge variant="outline" className={getTypeColor(event.type)}>
                                {event.type}
                              </Badge>
                              <Badge variant="outline" className={getStatusColor(event.status)}>
                                {event.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{event.time}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{event.attendees} attendees</span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mt-2">
                              {event.description}
                            </p>
                          </div>
                        </div>
                        
                        <Button size="sm" variant="outline">
                          View Details
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}