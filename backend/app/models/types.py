"""Database type helpers for PostgreSQL and SQLite compatibility."""
from sqlalchemy import BigInteger, Integer

# Uses BIGINT on PostgreSQL (BIGSERIAL) and INTEGER on SQLite for primary key autoincrement
PK_TYPE = BigInteger().with_variant(Integer, "sqlite")
FK_TYPE = BigInteger().with_variant(Integer, "sqlite")
