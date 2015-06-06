class AddCategoryToResults < ActiveRecord::Migration
  def change
    add_column :results, :category, :integer
    add_column :results, :video_id, :string
  end
end
