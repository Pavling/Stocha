class Song
  include Mongoid::Document

  belongs_to :user

  field :title, type: String, default: ""
  			

  field :sequencers, type: Hash, default: {}
  field :parameters, type: Hash, default: {}

end
