import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Plus, Clock, MapPin, Users } from "lucide-react";
import { format, isSameDay } from "date-fns";

const events = [
  {
    id: 1,
    title: "Youth Bible Study",
    date: new Date(2024, 0, 15),
    time: "7:00 PM",
    location: "Youth Room",
    type: "study",
    group: "Young",
    description: "Weekly Bible study for young leaders"
  },
  {
    id: 2,
    title: "Community Service",
    date: new Date(2024, 0, 18),
    time: "9:00 AM",
    location: "Community Center",
    type: "service",
    group: "Young",
    description: "Volunteer at local food bank"
  },
  {
    id: 3,
    title: "Youth Leadership Meeting",
    date: new Date(2024, 0, 22),
    time: "6:30 PM",
    location: "Conference Room",
    type: "meeting",
    group: "Young",
    description: "Monthly leadership team meeting"
  },
  {
    id: 4,
    title: "Game Night",
    date: new Date(2024, 0, 25),
    time: "7:00 PM",
    location: "Fellowship Hall",
    type: "social",
    group: "Young",
    description: "Fun game night for youth group"
  }
];

const getEventTypeColor = (type: string) => {
  switch (type) {
    case "study": return "bg-blue-500/10 text-blue-700 border-blue-200";
    case "service": return "bg-green-500/10 text-green-700 border-green-200";
    case "meeting": return "bg-purple-500/10 text-purple-700 border-purple-200";
    case "social": return "bg-orange-500/10 text-orange-700 border-orange-200";
    default: return "bg-gray-500/10 text-gray-700 border-gray-200";
  }
};

export default function YouthCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [viewMode, setViewMode] = useState("calendar");

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const upcomingEvents = events
    .filter(event => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Young Group Calendar</h1>
          <p className="text-muted-foreground">Manage events and activities for your group</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calendar">Calendar</SelectItem>
              <SelectItem value="list">List View</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input id="title" placeholder="Enter event title" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Event location" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Event Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="study">Bible Study</SelectItem>
                      <SelectItem value="service">Community Service</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="social">Social Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Event description" />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => setIsAddEventOpen(false)} className="flex-1">
                    Create Event
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Calendar View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full flex justify-center px-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                numberOfMonths={2}
                className="max-w-full [&_table]:w-full [&_td]:text-center [&_th]:text-center [&_.rdp-cell]:p-2 [&_.rdp-day]:w-full [&_.rdp-day]:h-10 [&_.rdp-day]:text-sm [&_.rdp-months]:flex [&_.rdp-months]:gap-20 [&_.rdp-months]:justify-center [&_.rdp-month]:flex-shrink-0 pointer-events-auto"
                modifiers={{
                  hasEvent: (date) => events.some(event => isSameDay(event.date, date))
                }}
                modifiersStyles={{
                  hasEvent: { 
                    backgroundColor: "hsl(var(--primary))", 
                    color: "hsl(var(--primary-foreground))",
                    fontWeight: "bold",
                    borderRadius: "6px"
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-sm">{event.title}</h4>
                  <Badge className={getEventTypeColor(event.type)}>{event.type}</Badge>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {format(event.date, "MMM dd, yyyy")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {event.time}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{event.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              Events for {format(selectedDate, "MMMM dd, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getEventsForDate(selectedDate).length > 0 ? (
              <div className="space-y-3">
                {getEventsForDate(selectedDate).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{event.title}</h4>
                        <Badge className={getEventTypeColor(event.type)}>{event.type}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.group} Group
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No events scheduled for this date</p>
                <Button variant="outline" className="mt-2" onClick={() => setIsAddEventOpen(true)}>
                  Add Event
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}