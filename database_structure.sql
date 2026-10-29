--
-- PostgreSQL database dump
--

\restrict Lp9RFsA16ZYL7haPg0gtmYA49dNH52Kp1Jid2lwYHQ9Ielg4aNhtzzCG6NJGUtE

-- Dumped from database version 15.15 (Debian 15.15-1.pgdg13+1)
-- Dumped by pg_dump version 15.15 (Debian 15.15-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: detailing_user
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO detailing_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: detailing_user
--

CREATE TABLE public.appointments (
    id integer NOT NULL,
    client_name character varying(255) NOT NULL,
    client_phone character varying(50) NOT NULL,
    client_email character varying(255),
    service_id integer,
    service_name character varying(255) NOT NULL,
    date date NOT NULL,
    "time" time without time zone NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    employee_id uuid,
    employee_name character varying(255),
    price numeric(10,2) NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT appointments_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'confirmed'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.appointments OWNER TO detailing_user;

--
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: detailing_user
--

CREATE SEQUENCE public.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.appointments_id_seq OWNER TO detailing_user;

--
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: detailing_user
--

ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;


--
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: detailing_user
--

CREATE TABLE public.inventory_items (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    sku character varying(100) NOT NULL,
    quantity numeric(12,4) DEFAULT 0 NOT NULL,
    minimum_threshold numeric(12,4) DEFAULT 0 NOT NULL,
    unit character varying(20) DEFAULT 'шт'::character varying NOT NULL,
    location character varying(255),
    last_updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    min_stock double precision,
    cost double precision
);


ALTER TABLE public.inventory_items OWNER TO detailing_user;

--
-- Name: inventory_items_id_seq; Type: SEQUENCE; Schema: public; Owner: detailing_user
--

CREATE SEQUENCE public.inventory_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inventory_items_id_seq OWNER TO detailing_user;

--
-- Name: inventory_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: detailing_user
--

ALTER SEQUENCE public.inventory_items_id_seq OWNED BY public.inventory_items.id;


--
-- Name: inventory_transactions; Type: TABLE; Schema: public; Owner: detailing_user
--

CREATE TABLE public.inventory_transactions (
    id integer NOT NULL,
    inventory_item_id integer,
    change_amount numeric(12,4) NOT NULL,
    transaction_type character varying(20) NOT NULL,
    reason text,
    performed_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT inventory_transactions_transaction_type_check CHECK (((transaction_type)::text = ANY ((ARRAY['in'::character varying, 'out'::character varying, 'adjustment'::character varying])::text[])))
);


ALTER TABLE public.inventory_transactions OWNER TO detailing_user;

--
-- Name: inventory_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: detailing_user
--

CREATE SEQUENCE public.inventory_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inventory_transactions_id_seq OWNER TO detailing_user;

--
-- Name: inventory_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: detailing_user
--

ALTER SEQUENCE public.inventory_transactions_id_seq OWNED BY public.inventory_transactions.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: detailing_user
--

CREATE TABLE public.services (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    duration_minutes integer NOT NULL,
    image character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    duration integer,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.services OWNER TO detailing_user;

--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: detailing_user
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.services_id_seq OWNER TO detailing_user;

--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: detailing_user
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: detailing_user
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(255),
    phone character varying(50),
    role character varying(20) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'employee'::character varying, 'client'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO detailing_user;

--
-- Name: appointments id; Type: DEFAULT; Schema: public; Owner: detailing_user
--

ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);


--
-- Name: inventory_items id; Type: DEFAULT; Schema: public; Owner: detailing_user
--

ALTER TABLE ONLY public.inventory_items ALTER COLUMN id SET DEFAULT nextval('public.inventory_items_id_seq'::regclass);


--
-- Name: inventory_transactions id; Type: DEFAULT; Schema: public; Owner: detailing_user
--

ALTER TABLE ONLY public.inventory_transactions ALTER COLUMN id SET DEFAULT nextval('public.inventory_transactions_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: detailing_user
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: detailing_user
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: detailing_user
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- Name: inventory_items inventory_items_sku_key; Type: CONSTRAINT; Schema: public; Owner: detailing_user
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_sku_key UNIQUE (sku);


--
-- Name: inventory_transactions inventory_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: detailing_user
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: detailing_user
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: detailing_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: detailing_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_appointments_client_email; Type: INDEX; Schema: public; Owner: detailing_user
--

CREATE INDEX idx_appointments_client_email ON public.appointments USING btree (client_email);


--
-- Name: idx_appointments_date; Type: INDEX; Schema: public; Owner: detailing_user
--

CREATE INDEX idx_appointments_date ON public.appointments USING btree (date);


--
-- Name: idx_appointments_status; Type: INDEX; Schema: public; Owner: detailing_user
--

CREATE INDEX idx_appointments_status ON public.appointments USING btree (status);


--
-- Name: idx_inventory_items_sku; Type: INDEX; Schema: public; Owner: detailing_user
--

CREATE INDEX idx_inventory_items_sku ON public.inventory_items USING btree (sku);


--
-- Name: idx_inventory_transactions_item_id; Type: INDEX; Schema: public; Owner: detailing_user
--

CREATE INDEX idx_inventory_transactions_item_id ON public.inventory_transactions USING btree (inventory_item_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: detailing_user
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: appointments update_appointments_updated_at; Type: TRIGGER; Schema: public; Owner: detailing_user
--

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: detailing_user
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: appointments appointments_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: detailing_user
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id);


--
-- Name: appointments appointments_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: detailing_user
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: inventory_transactions inventory_transactions_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: detailing_user
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id);


--
-- Name: inventory_transactions inventory_transactions_performed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: detailing_user
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict Lp9RFsA16ZYL7haPg0gtmYA49dNH52Kp1Jid2lwYHQ9Ielg4aNhtzzCG6NJGUtE

