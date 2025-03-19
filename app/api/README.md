# Nomen API Documentation

This document provides details about the available API endpoints in the Nomen application. All endpoints return JSON responses.

## Endpoints

### Name Search API

Retrieves historical data for a specific name and optionally filtered by sex.

```
GET /api/names
```

#### Query Parameters

| Parameter | Type   | Required | Description            |
| --------- | ------ | -------- | ---------------------- |
| name      | string | Yes      | The name to search for |
| sex       | string | No       | Filter by sex (M or F) |

#### Response Format

```json
[
  {
    "name": "John",
    "sex": "M",
    "amount": 12345,
    "year": 1950
  }
  // Additional records...
]
```

#### Example

```
GET /api/names?name=John&sex=M
```

### Popular Names API

Retrieves most popular names across all time or for a specific year.

```
GET /api/popular
```

#### Query Parameters

| Parameter | Type   | Required | Description                                   |
| --------- | ------ | -------- | --------------------------------------------- |
| year      | string | Yes      | The year to search for, or 'all' for all time |
| sex       | string | No       | Filter by sex (M or F)                        |

#### Response Format

```json
{
  "success": true,
  "data": [
    {
      "name": "John",
      "total": 1234567
    }
    // Additional records...
  ]
}
```

#### Example

```
GET /api/popular?year=2000&sex=M
```

### Year-Based Names API

Retrieves names for a specific year, sorted by popularity.

```
GET /api/year
```

#### Query Parameters

| Parameter | Type   | Required | Description                                   |
| --------- | ------ | -------- | --------------------------------------------- |
| year      | string | Yes      | The year to search for, or 'all' for all time |
| sex       | string | No       | Filter by sex (M or F)                        |

#### Response Format

```json
{
  "success": true,
  "data": [
    {
      "name": "John",
      "sex": "M",
      "amount": 12345,
      "year": 2000
    }
    // Additional records...
  ]
}
```

#### Example

```
GET /api/year?year=2000&sex=M
```

### State-Based Names API

Retrieves name data for specific states.

```
GET /api/state
```

#### Query Parameters

| Parameter | Type   | Required | Description                          |
| --------- | ------ | -------- | ------------------------------------ |
| name      | string | Yes      | The name to search for               |
| sex       | string | No       | Filter by sex (M or F)               |
| state     | string | No       | Two-letter state code (e.g., CA, NY) |

#### Response Format

```json
[
  {
    "name": "John",
    "sex": "M",
    "amount": 1234,
    "year": 2000,
    "state": "CA"
  }
  // Additional records...
]
```

#### Example

```
GET /api/state?name=John&sex=M&state=CA
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- 200: Successful request
- 400: Bad request (missing required parameters)
- 500: Server error

Error responses follow this format:

```json
{
  "error": "Error message description"
}
```

For the `/api/year` and `/api/popular` endpoints:

```json
{
  "success": false,
  "message": "Error message description"
}
```

## Rate Limiting

Please be mindful of rate limits when making requests to these API endpoints.
