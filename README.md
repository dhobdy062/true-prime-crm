# True Prime B2B CRM

A Kanban-style CRM interface for managing leads and sales team assignments.

## Features

- Drag-and-drop lead assignment
- Lead filtering by industry and city
- Lead detail viewing and editing
- Disposition tracking
- Note-taking capabilities
- Maximum lead caps for sales team members

## Setup

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm start` to launch the development server
4. Open `http://localhost:3000` in your browser

## Airtable Integration

This project is designed to integrate with an Airtable base. To connect to your Airtable:

1. Obtain your Airtable API key and base ID
2. Configure the API connection in src/utils/airtable.js (create this file)
3. Map the fields according to your Airtable schema

## Airtable Schema

The CRM is designed to work with the following Airtable tables:

- Leads: Contains lead information (name, company, contact details)
- SalesPerson: Information about sales team members
- Note: Track communication history with leads

## Future Enhancements

- Lead scoring system
- Email integration
- Calendar synchronization
- Activity timeline
- Performance dashboards
- Mobile optimization

## lets's hope it works
