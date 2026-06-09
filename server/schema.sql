-- Run this once against your Railway PostgreSQL database to set up the schema.
-- In Railway: open your PostgreSQL service → Data tab → paste and run.

CREATE TABLE IF NOT EXISTS registrations (
  id            SERIAL PRIMARY KEY,
  first_name    VARCHAR(100)  NOT NULL,
  middle_name   VARCHAR(100),
  last_name     VARCHAR(100)  NOT NULL,
  name          VARCHAR(300)  NOT NULL,
  dob           VARCHAR(50),
  dcc_zone      VARCHAR(200),
  gender        VARCHAR(20),
  phone         VARCHAR(30),
  email         VARCHAR(200),
  state         VARCHAR(20),
  status        VARCHAR(50),
  occupation    VARCHAR(200),
  qualification VARCHAR(100),
  denomination  VARCHAR(200),
  unique_code   VARCHAR(60)   UNIQUE NOT NULL,
  payment_ref   VARCHAR(200),
  tx_ref        VARCHAR(200),
  amount        INTEGER       DEFAULT 3000,
  payment_status VARCHAR(20)  DEFAULT 'pending',
  verified      BOOLEAN       DEFAULT FALSE,
  verified_at   TIMESTAMPTZ,
  registered_at TIMESTAMPTZ   DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff (
  id                  SERIAL PRIMARY KEY,
  name                VARCHAR(200) NOT NULL,
  email               VARCHAR(200),
  username            VARCHAR(100) UNIQUE NOT NULL,
  password            VARCHAR(200) NOT NULL,
  state               VARCHAR(20)  NOT NULL,
  must_change_password BOOLEAN     DEFAULT TRUE,
  created_at          TIMESTAMPTZ  DEFAULT NOW()
);

-- Safe migration: add columns if they don't exist yet
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='staff' AND column_name='email') THEN
    ALTER TABLE staff ADD COLUMN email VARCHAR(200);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='staff' AND column_name='must_change_password') THEN
    ALTER TABLE staff ADD COLUMN must_change_password BOOLEAN DEFAULT TRUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='registrations' AND column_name='denomination') THEN
    ALTER TABLE registrations ADD COLUMN denomination VARCHAR(200);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='registrations' AND column_name='assembly_name') THEN
    ALTER TABLE registrations ADD COLUMN assembly_name VARCHAR(200);
  END IF;
END $$;
