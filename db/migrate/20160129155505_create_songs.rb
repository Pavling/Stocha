class CreateSongs < ActiveRecord::Migration
  def change
    create_table :songs do |t|
      t.string :title
      t.integer :bpm, default: 120
      t.text :song_data
      t.integer :user_id
    end
  end
end
