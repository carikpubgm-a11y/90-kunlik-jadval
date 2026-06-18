import json

def generate_backend_track():
    track = []
    
    # Month 1: Python Foundations (Days 1-30)
    foundations = [
        "Introduction to Python & Setup", "Variables & Data Types", "Basic Operators",
        "String Manipulation", "Lists & Tuples", "Dictionaries & Sets",
        "Control Flow: If/Else", "Loops: For & While", "Functions & Scope",
        "Error Handling & Exceptions", "File I/O Basics", "Modules & Imports",
        "List Comprehensions", "Lambda Functions", "Virtual Environments",
        "Classes & Objects", "Inheritance & Polymorphism", "Dunder Methods",
        "Decorators Basics", "Iterators & Generators", "Working with JSON",
        "Working with CSVs", "Regex Basics", "Datetime Module",
        "Math & Random Modules", "Collections Module", "Debugging Basics",
        "Unit Testing Basics", "Git & GitHub Basics", "Month 1 Project: CLI App"
    ]
    
    # Month 2: Professional Python (Days 31-60)
    professional = [
        "Advanced Decorators", "Context Managers", "Metaclasses",
        "Concurrency: Threads", "Concurrency: Multiprocessing", "Asyncio Basics",
        "Type Hinting", "Dataclasses", "Pydantic Basics",
        "Advanced Error Handling", "Logging", "Design Patterns: Singleton & Factory",
        "Design Patterns: Observer & Strategy", "Clean Code Principles", "SOLID Principles",
        "Testing with Pytest", "Mocking in Tests", "Test Coverage",
        "CI/CD Basics", "Docker Basics", "Dockerizing Python Apps",
        "Working with Databases (SQLite)", "PostgreSQL Basics", "SQLAlchemy ORM Basics",
        "Advanced SQLAlchemy", "Alembic Migrations", "Redis Basics",
        "Celery Task Queues", "Advanced Git Workflows", "Month 2 Project: Data Pipeline"
    ]
    
    # Month 3: Backend Development (Days 61-90)
    backend = [
        "Web Basics (HTTP, REST)", "FastAPI Introduction", "FastAPI Routes & Parameters",
        "FastAPI Pydantic Models", "FastAPI Dependency Injection", "FastAPI Authentication (JWT)",
        "FastAPI Middleware", "FastAPI Background Tasks", "FastAPI Testing",
        "Django Introduction", "Django Models & Admin", "Django Views & URLs",
        "Django Templates", "Django REST Framework (DRF) Basics", "DRF Serializers",
        "DRF ViewSets & Routers", "DRF Authentication & Permissions", "GraphQL Basics (Strawberry/Graphene)",
        "WebSockets in Python", "Microservices Architecture Basics", "API Gateway & Reverse Proxy (Nginx)",
        "Caching Strategies", "Rate Limiting", "Monitoring & Logging (Prometheus/Grafana)",
        "AWS/GCP Deployment Basics", "Serverless Python (AWS Lambda)", "Security Best Practices (OWASP)",
        "Performance Profiling", "Scaling Backend Systems", "Month 3 Project: Full Backend API"
    ]
    
    all_days = foundations + professional + backend
    
    for day in range(1, 91):
        task = {
            "id": f"backend_day_{day}",
            "day": day,
            "title": all_days[day-1],
            "description": f"Master {all_days[day-1]} and apply it in coding exercises.",
            "type": "coding",
            "xp": 100 + (day // 10) * 10,  # Progressive XP
            "completed": False
        }
        track.append(task)
        
    return track

def generate_english_track():
    track = []
    
    for day in range(1, 91):
        level = "Beginner/Intermediate" if day <= 30 else ("Intermediate/Advanced" if day <= 60 else "Advanced/Fluent")
        vocab_words = 5 + (day // 30) * 2  # Increasing vocab words
        
        task = {
            "id": f"english_day_{day}",
            "day": day,
            "title": f"English Mastery: Day {day}",
            "description": f"Daily comprehensive English practice ({level}).",
            "type": "language",
            "xp": 150,
            "completed": False,
            "sub_tasks": [
                {"title": f"Vocabulary: Learn {vocab_words} new words", "completed": False},
                {"title": f"Grammar: Practice day {day} rules", "completed": False},
                {"title": "Reading: Read 1 article/chapter", "completed": False},
                {"title": "Listening: Listen to 15 mins of podcast/video", "completed": False},
                {"title": "Speaking: Record a 2-minute summary", "completed": False}
            ]
        }
        track.append(task)
        
    return track

def generate_academic_ai_track():
    track = []
    
    topics = [
        ("SEO Mastery", 15),
        ("Content Strategy", 15),
        ("Marketing Tactics", 15),
        ("Analytics & Data", 15),
        ("Monetization Strategies", 15),
        ("Feature & Product Improvement", 15)
    ]
    
    day_counter = 1
    for topic, days in topics:
        for i in range(days):
            task = {
                "id": f"academic_day_{day_counter}",
                "day": day_counter,
                "title": f"{topic} - Part {i+1}",
                "description": f"Deep dive into {topic.lower()} principles and application.",
                "type": "academic",
                "xp": 120 + (day_counter // 15) * 10,
                "completed": False
            }
            track.append(task)
            day_counter += 1
            
    return track

def main():
    curriculum = {
        "metadata": {
            "total_days": 90,
            "version": "1.0",
            "description": "The complete 90-day transformation curriculum."
        },
        "tracks": {
            "backend": generate_backend_track(),
            "english": generate_english_track(),
            "academic_ai": generate_academic_ai_track()
        }
    }
    
    with open("curriculum.json", "w") as f:
        json.dump(curriculum, f, indent=4)
        
    print("curriculum.json generated successfully.")

if __name__ == "__main__":
    main()
