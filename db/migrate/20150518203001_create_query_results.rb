class CreateQueryResults < ActiveRecord::Migration
  def change
    create_table :query_results do |t|
      t.integer :query_id
      t.integer :result_id
      t.boolean :match

      t.timestamps null: false
    end
    add_index :query_results, :query_id
    add_index :query_results, :result_id
  end
end