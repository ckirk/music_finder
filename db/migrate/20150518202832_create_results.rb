class CreateResults < ActiveRecord::Migration
  def change
    create_table :results do |t|
      t.integer :order
      t.string :title
      t.bigint :view_count
      t.integer :like_count
      t.text :description
      t.integer :duration
      t.datetime :date_published

      t.timestamps null: false
    end
  end
end
