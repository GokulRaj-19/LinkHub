"""Seed the LinkHub database with demo data."""

from app import create_app
from app.extensions import db
from app.models.category import Category
from app.models.user import User


def run_seed():
    """Create tables and insert demo data."""

    app = create_app()

    with app.app_context():
        # Create missing tables without deleting existing tables.
        db.create_all()

        print("Checking demo users...")

        demo_users = [
            {
                "email": "priya@example.com",
                "full_name": "Priya Sharma",
                "role": "user",
                "theme": "brand",
                "password": "password123",
            },
            {
                "email": "ravi@example.com",
                "full_name": "Ravi Kumar",
                "role": "user",
                "theme": "sketch",
                "password": "password123",
            },
            {
                "email": "meena@example.com",
                "full_name": "Meena Patel",
                "role": "user",
                "theme": "dark",
                "password": "password123",
            },
            {
                "email": "admin@linkhub.dev",
                "full_name": "System Admin",
                "role": "admin",
                "theme": "sketch",
                "password": "adminpassword",
            },
        ]

        for item in demo_users:
            user = User.query.filter_by(email=item["email"]).first()

            if user:
                print(f"User already exists: {item['email']}")
                continue

            user = User(
                email=item["email"],
                full_name=item["full_name"],
                role=item["role"],
                theme=item["theme"],
            )
            user.set_password(item["password"])
            db.session.add(user)
            print(f"Added user: {item['email']}")

        db.session.commit()
        print("Demo users processed successfully.")

        print("Checking default categories...")

        priya = User.query.filter_by(email="priya@example.com").first()

        if priya:
            default_categories = [
                ("Work", "#7048E0"),
                ("Learning", "#28A8E0"),
                ("Dev Tools", "#E65100"),
            ]

            for name, color in default_categories:
                category = Category.query.filter_by(
                    user_id=priya.id,
                    name=name,
                ).first()

                if not category:
                    db.session.add(
                        Category(
                            user_id=priya.id,
                            name=name,
                            color=color,
                        )
                    )

            db.session.commit()

        print("Seed completed successfully.")


if __name__ == "__main__":
    run_seed()
