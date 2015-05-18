class CreateQueries < ActiveRecord::Migration
  def change
    create_table :queries do |t|
      t.string :artist
      t.string :album
      t.string :query
      t.integer :duration
      t.datetime :date_published

      t.timestamps null: false
    end
  end
end