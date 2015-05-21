# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150521231554) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "queries", force: :cascade do |t|
    t.string   "artist"
    t.string   "track"
    t.string   "query"
    t.integer  "duration"
    t.datetime "date_published"
    t.datetime "created_at",     null: false
    t.datetime "updated_at",     null: false
  end

  create_table "query_results", force: :cascade do |t|
    t.integer  "query_id"
    t.integer  "result_id"
    t.boolean  "match"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "query_results", ["query_id"], name: "index_query_results_on_query_id", using: :btree
  add_index "query_results", ["result_id"], name: "index_query_results_on_result_id", using: :btree

  create_table "results", force: :cascade do |t|
    t.integer  "order"
    t.string   "title"
    t.integer  "view_count",     limit: 8
    t.integer  "like_count"
    t.text     "description"
    t.integer  "duration"
    t.datetime "date_published"
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
    t.boolean  "match"
    t.integer  "query_id"
  end

end
